from flask import Flask, redirect, url_for, render_template, request, jsonify
from flask_login import LoginManager, login_user, logout_user, current_user, login_required
from config import Config
from datetime import timedelta
from flask_jwt_extended import create_access_token, JWTManager
from Database.models import (db, User, Book, Message, Listing, Transaction, Transaction_BookID, Sends, Receives,
                             Requesting, Covers, Initiate)

app = Flask(__name__)
app.config.from_object(Config)

db.init_app(app)
login_manager = LoginManager(app)

app.config['JWT_SECRET_KEY'] = 'your_secret_key'  # Replace with a secure secret key
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=1)  # Token expiration time
jwt = JWTManager(app)

# User loader function for Flask-Login
@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        data = request.get_json()
        username = data.get('username')
        password = data.get('password')

        user = User.query.filter_by(username=username).first()
        if user and user.password == password:
            login_user(user)
            access_token = create_access_token(identity={'id': user.user_id, 'username': user.username})
            return jsonify({
                'message': 'Login successful',
                'status': 'success',
                'authToken': access_token  # Token sent to the frontend
            }), 200
        else:
            return jsonify({'message': 'Invalid credentials. Please try again.', 'status': 'error'}), 401

@app.route('/logout', methods=['POST'])
@login_required
def logout():
    logout_user()
    return 'logged out succesfully'


@app.route('/register', methods=['GET', 'POST'])
def create_user():
    if request.method == 'POST':
        data = request.get_json()
        name = data.get('name')
        phone = data.get('phone')
        email = data.get('email')
        address = data.get('address')
        username = data.get('username')
        password = data.get('password')

        new_user = User(
            name=name,
            phone=phone,
            email=email,
            address=address,
            username=username,
            password=password
        )

        if not all([name, phone, email, address, username, password]):
            return jsonify({'error': 'All fields are required'}), 400

        if User.query.filter_by(username=username).first():
            return jsonify({'error': 'Username already exists'}), 400

        if User.query.filter_by(email=email).first():
            return jsonify({'error': 'Email already exists'}), 400

        try:
            db.session.add(new_user)
            db.session.commit()
            return "\nUser registered successfully!"
        except Exception as e:
            db.session.rollback()
            return f"\nError registering user: {e}"

@app.route('/user_data', methods=['GET'])
def user_data():
    user = User.query.filter_by(user_id=current_user.user_id).first()
    current_user_data = {
        "user_id": user.user_id,
        "name": user.name,
        "phone": user.phone,
        "email": user.email,
        "address": user.address,
    }
    return current_user_data
# Add book function
@app.route('/add_book', methods=['GET', 'POST'])
def add_book():
    if request.method == 'POST':
        data = request.get_json()
        ibsn = data.get('IBSN')
        title = data.get('title')
        author = data.get('author')
        genre = data.get('genre')
        condition = data.get('condition')
        description = data.get('description')

        new_book = Book(
            IBSN=ibsn,
            title=title,
            author=author,
            genre=genre,
            condition=condition,
            description=description,
            ownerID=current_user.user_id
        )

        db.session.add(new_book)
        db.session.commit()
    return "Book added successfully!"
# List books function
@app.route('/list_user_books', methods=['GET'])
def list_user_books():
    try:
        books = Book.query.filter_by(availability=True, ownerID=current_user.user_id).all()
        if not books:
            return jsonify({"message": "No books available."})

        # Prepare the list of books to return
        books_list = [
            {
                "IBSN": book.IBSN,
                "title": book.title,
                "author": book.author,
                "genre": book.genre,
                "condition": book.condition,
                "description": book.description,
                "availability": book.availability,
                "ownerID": book.ownerID
            }
            for book in books
        ]

        return jsonify({"books": books_list})

    except Exception as e:
        return jsonify({"error": str(e)})

@app.route('/search_books', methods=['GET'])
def search_books():
    try:
        # Retrieve search parameters from query string
        title = request.args.get('title', '').lower()
        author = request.args.get('author', '').lower()
        genre = request.args.get('genre', '').lower()
        condition = request.args.get('condition', '').lower()
        ibsn = request.args.get('ibsn', '').lower()

        # Build a query dynamically based on the provided filters
        query = Book.query
        if title:
            query = query.filter(Book.title.ilike(f"%{title}%"))
        if author:
            query = query.filter(Book.author.ilike(f"%{author}%"))
        if genre:
            query = query.filter(Book.genre.ilike(f"%{genre}%"))
        if condition:
            query = query.filter(Book.condition.ilike(f"%{condition}%"))
        if ibsn:
            query = query.filter(Book.ibsn.ilike(f"%{ibsn}%"))

        # Execute the query and get the results
        books = query.filter_by(availability=True).all()

        # Check if any books were found
        if not books:
            return jsonify({"message": "No books match your search criteria."}), 404

        # Prepare the list of books to return
        books_list = [
            {
                "IBSN": book.IBSN,
                "title": book.title,
                "author": book.author,
                "genre": book.genre,
                "condition": book.condition,
                "description": book.description,
                "availability": book.availability,
                "ownerID": book.ownerID
            }
            for book in books
        ]

        return jsonify({"books": books_list}), 200

    except Exception as e:
        return jsonify({"error": f"An error occurred while searching for books: {e}"}), 500

@app.route('/send_message', methods=['POST'])
@login_required
def send_message():
    data = request.get_json()
    data = data.get('data')
    if not data:
        return jsonify({"message": "No data provided!"}), 400

    content = data.get('content')
    receiver_id = data.get('receiver_id')

    # Log the received data for debugging
    app.logger.info(f"Received data: {data}")

    if not content or not receiver_id:
        return jsonify({"message": "Content and receiver are required!"}), 400

    # Create the new message
    new_message = Message(
        contents=content,
        senderID=current_user.user_id,
        recieverID=receiver_id
    )

    try:
        db.session.add(new_message)
        db.session.commit()
        return jsonify({"message": "Message sent successfully!"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": "Failed to send message", "error": str(e)}), 500

@app.route('/get_messages', methods=['GET'])
@login_required
def get_messages():
    messages = Message.query.filter_by(recieverID=current_user.user_id).all()

    # Serialize messages
    messages_list = [
        {
            "messageID": msg.messageID,
            "contents": msg.contents,
            "timestamp": msg.timestamp,
            "senderID": msg.senderID,
            "recieverID": msg.recieverID
        }
        for msg in messages
    ]
    return jsonify({"messages": messages_list}), 200

if __name__ == '__main__':
    with app.app_context():
        db.create_all()  # Create all tables if they don't already exist
    app.run(debug=True)
