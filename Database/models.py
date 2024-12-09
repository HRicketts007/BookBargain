from flask_sqlalchemy import SQLAlchemy
from flask_login import UserMixin
from datetime import datetime

db = SQLAlchemy()


# User Table
class User(UserMixin, db.Model):
    __tablename__ = 'User'

    user_id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    phone = db.Column(db.String(20), nullable=False)
    email = db.Column(db.String(100), nullable=False, unique=True)
    address = db.Column(db.String(200), nullable=False)
    username = db.Column(db.String(50), nullable=False, unique=True)
    password = db.Column(db.String(100), nullable=False)

    # Relationships to other tables
    books = db.relationship('Book', backref='owner', lazy=True)
    messages_sent = db.relationship('Message', foreign_keys='Message.senderID', backref='sender', lazy=True)
    messages_received = db.relationship('Message', foreign_keys='Message.recieverID', backref='reciever', lazy=True)
    transactions_sent = db.relationship('Transaction', foreign_keys='Transaction.senderID', backref='sender', lazy=True)
    transactions_received = db.relationship('Transaction', foreign_keys='Transaction.recieverID', backref='reciever',
                                            lazy=True)

    def __repr__(self):
        return f"<User {self.username}>"

    def get_id(self):
        return str(self.user_id)


# Book Table
class Book(db.Model):
    __tablename__ = 'Book'

    IBSN = db.Column(db.String(13), primary_key=True)
    author = db.Column(db.String(100), nullable=False)
    genre = db.Column(db.String(50), nullable=False)
    title = db.Column(db.String(200), nullable=False)
    condition = db.Column(db.String(50), nullable=False)
    description = db.Column(db.String(500), nullable=True)
    availability = db.Column(db.Boolean, default=True)
    ownerID = db.Column(db.Integer, db.ForeignKey('User.user_id'), nullable=False)

    # Relationship to Transaction and other tables
    transactions = db.relationship('Transaction_BookID', backref='book', lazy=True)

    def __repr__(self):
        return f"<Book {self.title} by {self.author}>"


# Message Table
class Message(db.Model):
    __tablename__ = 'Message'

    messageID = db.Column(db.Integer, primary_key=True)
    contents = db.Column(db.String(1000), nullable=False)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    senderID = db.Column(db.Integer, db.ForeignKey('User.user_id'), nullable=False)
    recieverID = db.Column(db.Integer, db.ForeignKey('User.user_id'), nullable=False)

    def __repr__(self):
        return f"<Message {self.messageID} from {self.senderID} to {self.recieverID}>"


# Transaction Table
class Transaction(db.Model):
    __tablename__ = 'Transaction'

    TransactionID = db.Column(db.Integer, primary_key=True)
    senderID = db.Column(db.Integer, db.ForeignKey('User.user_id'), nullable=False)
    recieverID = db.Column(db.Integer, db.ForeignKey('User.user_id'), nullable=False)
    status = db.Column(db.String(50), nullable=False)
    date = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationship to Transaction_BookID
    books = db.relationship('Transaction_BookID', backref='transaction', lazy=True)

    def __repr__(self):
        return f"<Transaction {self.TransactionID} between {self.senderID} and {self.recieverID}>"


# Transaction_BookID Table
class Transaction_BookID(db.Model):
    __tablename__ = 'Transaction_BookID'

    TransactionID = db.Column(db.Integer, db.ForeignKey('Transaction.TransactionID'), primary_key=True)
    IBSN = db.Column(db.String(13), db.ForeignKey('Book.IBSN'), primary_key=True)

    def __repr__(self):
        return f"<Transaction_BookID {self.TransactionID} - {self.IBSN}>"


# Sends Table
class Sends(db.Model):
    __tablename__ = 'sends'

    user_id = db.Column(db.Integer, db.ForeignKey('User.user_id'), primary_key=True)
    messageID = db.Column(db.Integer, db.ForeignKey('Message.messageID'), primary_key=True)

    def __repr__(self):
        return f"<Sends user_id {self.user_id} messageID {self.messageID}>"


# Receives Table
class Receives(db.Model):
    __tablename__ = 'receives'

    user_id = db.Column(db.Integer, db.ForeignKey('User.user_id'), primary_key=True)
    messageID = db.Column(db.Integer, db.ForeignKey('Message.messageID'), primary_key=True)

    def __repr__(self):
        return f"<Receives user_id {self.user_id} messageID {self.messageID}>"


# Requesting Table
class Requesting(db.Model):
    __tablename__ = 'requesting'

    user_id = db.Column(db.Integer, db.ForeignKey('User.user_id'), primary_key=True)
    IBSN = db.Column(db.String(13), db.ForeignKey('Book.IBSN'), primary_key=True)

    def __repr__(self):
        return f"<Requesting user_id {self.user_id} IBSN {self.IBSN}>"


# Listing Table
class Listing(db.Model):
    __tablename__ = 'listing'

    user_id = db.Column(db.Integer, db.ForeignKey('User.user_id'), primary_key=True)
    IBSN = db.Column(db.String(13), db.ForeignKey('Book.IBSN'), primary_key=True)

    def __repr__(self):
        return f"<Listing user_id {self.user_id} IBSN {self.IBSN}>"


# Covers Table
class Covers(db.Model):
    __tablename__ = 'covers'

    TransactionID = db.Column(db.Integer, db.ForeignKey('Transaction.TransactionID'), primary_key=True)
    IBSN = db.Column(db.String(13), db.ForeignKey('Book.IBSN'), primary_key=True)

    def __repr__(self):
        return f"<Covers TransactionID {self.TransactionID} IBSN {self.IBSN}>"


# Initiate Table
class Initiate(db.Model):
    __tablename__ = 'initiate'

    TransactionID = db.Column(db.Integer, db.ForeignKey('Transaction.TransactionID'), primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('User.user_id'), primary_key=True)

    def __repr__(self):
        return f"<Initiate TransactionID {self.TransactionID} user_id {self.user_id}>"
