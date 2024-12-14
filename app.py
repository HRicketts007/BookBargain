import os
from flask import Flask, redirect, url_for, render_template, request, jsonify
from flask_login import LoginManager, login_user, logout_user, current_user, login_required
from config import Config
from datetime import timedelta
from flask_jwt_extended import create_access_token, JWTManager
from Database.models import (db, User, Book, Message, listing, Transaction, sends, covers, initiate)
import requests



app = Flask(__name__)
app.config.from_object(Config)

db.init_app(app)
login_manager = LoginManager(app)

app.config['JWT_SECRET_KEY'] = 'b82141492174h129bcbsiuafda2323'
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
            ibsn=ibsn,
            title=title,
            author=author,
            genre=genre,
            condition=condition,
            description=description,
            #ownerid=current_user.user_id
        )

        db.session.add(new_book)
        db.session.commit()

        listing_relation = listing(
            bookid=new_book.bookid,
            ownerid=current_user.user_id
        )

        db.session.add(listing_relation)
        db.session.commit()

    return "Book added successfully!"
# List books function

@app.route('/fetch_book_details', methods=['GET'])
def fetch_book_details():
    ibsn = request.args.get('ibsn')
    if not ibsn:
        return jsonify({"error": "ibsn is required"}), 400

    google_api_key = 'AIzaSyCJbZOEp2NaX7Z8wGFR4OXhRnaAlTPo-rQ'
    google_books_api_url = f"https://www.googleapis.com/books/v1/volumes?q=isbn:{ibsn}&key={google_api_key}"
    response = requests.get(google_books_api_url)
    if response.status_code != 200:
        return jsonify({"error": "Failed to fetch data from Google Books API"}), 500

    book_data = response.json()
    if "items" not in book_data:
        return jsonify({"error": "No book found with the provided IBSN"}), 404

    book_info = book_data["items"][0]["volumeInfo"]
    book_details = {
        "title": book_info.get("title"),
        "authors": book_info.get("authors"),
        "publisher": book_info.get("publisher"),
        "publishedDate": book_info.get("publishedDate"),
        "description": book_info.get("description"),
        "pageCount": book_info.get("pageCount"),
        "categories": book_info.get("categories"),
        "thumbnail": book_info.get("imageLinks", {}).get("thumbnail")
    }

    return jsonify(book_details), 200

@app.route('/list_user_books', methods=['GET'])
def list_user_books():
    try:
        books = db.session.query(Book, listing).join(listing, Book.bookid == listing.bookid).filter(listing.ownerid == current_user.user_id, Book.availability == True).all()
        if not books:
            return jsonify({"message": "No books available."})

        # Prepare the list of books to return
        books_list = [
            {
                "bookid": book.bookid,
                "ibsn": book.ibsn,
                "title": book.title,
                "author": book.author,
                "genre": book.genre,
                "condition": book.condition,
                "description": book.description,
                "availability": book.availability,
                "ownerid": listing.ownerid
            }
            for book, listing in books
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
        query = db.session.query(Book, listing).join(listing, Book.bookid == listing.bookid)
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

        # Exclude books added by the current user
        query = query.filter(listing.ownerid != current_user.user_id)

        # Execute the query and get the results
        books = query.filter(Book.availability == True).all()

        # Check if any books were found
        if not books:
            return jsonify({"message": "No books match your search criteria."}), 404

        # Prepare the list of books to return
        books_list = [
            {
                "bookid": book.bookid,
                "ibsn": book.ibsn,
                "title": book.title,
                "author": book.author,
                "genre": book.genre,
                "condition": book.condition,
                "description": book.description,
                "availability": book.availability,
                "ownerid": listing.ownerid
            }
            for book, listing in books
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
    message = Message(
        contents=content,
    )

    db.session.add(message)
    db.session.commit()

    sent_relation = sends(
        senderid=current_user.user_id,
        receiverid=receiver_id,
        messageid=message.messageid,
    )

    db.session.add(sent_relation)
    db.session.commit()

@app.route('/get_messages', methods=['GET'])
@login_required
def get_messages():
    try:
        messages = db.session.query(Message, sends).join(sends, Message.messageid == sends.messageid).filter(sends.receiverid == current_user.user_id).all()

        # Serialize messages
        messages_list = [
            {
                "messageid": msg.messageid,
                "contents": msg.contents,
                "timestamp": msg.timestamp,
                "senderid": send.senderid,
                "receiverid": send.receiverid
            }
            for msg, send in messages
        ]
        return jsonify({"messages": messages_list}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/bargain_invitation', methods=['POST'])
@login_required
def create_bargain():
    data = request.get_json()
    desired_book = data.get('desired_book')
    user_book = data.get('user_book')
    receiver_id = data.get('receiver_id')

    if not desired_book or not user_book or not receiver_id:
        return jsonify({"message": "All fields are required!"}), 400

    bargain_title = desired_book['title'] + " for " + user_book['title']

    transaction = Transaction(
        title=bargain_title,
        status='pending'
    )
    db.session.add(transaction)
    db.session.commit()

    Initiate = initiate(
        transactionid=transaction.transactionid,
        senderid=current_user.user_id,
        receiverid=receiver_id
    )
    db.session.add(Initiate)
    db.session.commit()

    Covers = covers(
        transactionid=transaction.transactionid,
        sent_id=user_book['bookid'],
        received_id=desired_book['bookid']
    )
    db.session.add(Covers)
    db.session.commit()

    return jsonify({"message": "Bargain invitation sent successfully!"}), 200

@app.route('/retrieve_bargains', methods=['GET'])
@login_required
def retrieve_bargains():
    bargains_sent = db.session.query(Transaction, initiate).join(initiate, Transaction.transactionid == initiate.transactionid).filter(initiate.senderid == current_user.user_id).all()
    bargains_received = db.session.query(Transaction, initiate).join(initiate, Transaction.transactionid == initiate.transactionid).filter(initiate.receiverid == current_user.user_id).all()

    transactions_sent = [
        {
            "transactionid": transaction.transactionid,
            "title": transaction.title,
            "status": transaction.status,
            "senderid": init.senderid,
            "receiverid": init.receiverid
        }
        for transaction, init in bargains_sent
    ]

    transactions_received = [
        {
            "transactionid": transaction.transactionid,
            "title": transaction.title,
            "status": transaction.status,
            "senderid": init.senderid,
            "receiverid": init.receiverid
        }
        for transaction, init in bargains_received
    ]

    return jsonify({"transactions_sent": transactions_sent, "transactions_received": transactions_received}), 200

@app.route('/accept_bargain', methods=['POST'])
@login_required
def accept_bargain():
    data = request.get_json()
    transaction_id = data.get('transaction_id')

    if not transaction_id:
        return jsonify({"message": "Transaction ID is required!"}), 400

    transaction = Transaction.query.get(transaction_id)
    if not transaction:
        return jsonify({"message": "Transaction not found!"}), 404

    transaction.status = 'in progress'
    db.session.commit()

    return jsonify({"message": "Transaction accepted successfully!"}), 200

@app.route('/finalize_bargain', methods=['POST'])
@login_required
def finalize_bargain():
    data = request.get_json()
    transaction_id = data.get('transaction_id')

    if not transaction_id:
        return jsonify({"message": "Transaction ID is required!"}), 400

    transaction = Transaction.query.get(transaction_id)
    if not transaction:
        return jsonify({"message": "Transaction not found!"}), 404

    transaction.status = 'completed'
    db.session.commit()

    return jsonify({"message": "Transaction finalized successfully!"}), 200


if __name__ == '__main__':
    with app.app_context():
        db.create_all()  # Create all tables if they don't already exist
    app.run(debug=True)
