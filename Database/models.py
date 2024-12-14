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
    books = db.relationship('listing', foreign_keys='listing.ownerid', backref='owner', lazy=True)
    messages_sent = db.relationship('sends', foreign_keys='sends.senderid', backref='sender', lazy=True)
    messages_received = db.relationship('sends', foreign_keys='sends.receiverid', backref='receiver', lazy=True)
    transactions_sent = db.relationship('initiate', foreign_keys='initiate.senderid', backref='sender', lazy=True)
    transactions_received = db.relationship('initiate', foreign_keys='initiate.receiverid', backref='receiver',lazy=True)

    def __repr__(self):
        return f"<User {self.username}>"

    def get_id(self):
        return str(self.user_id)


# Book Table
class Book(db.Model):
    __tablename__ = 'Book'
    bookid = db.Column(db.Integer, primary_key=True)
    ibsn = db.Column(db.String(13), nullable=False)
    author = db.Column(db.String(100), nullable=False)
    genre = db.Column(db.String(50), nullable=False)
    title = db.Column(db.String(200), nullable=False)
    condition = db.Column(db.String(50), nullable=False)
    description = db.Column(db.String(500), nullable=True)
    availability = db.Column(db.Boolean, default=True)
    #ownerid = db.Column(db.Integer, db.ForeignKey('listing.user_id'), nullable=False)

    # Relationship to Transaction and other tables
    covers_sent = db.relationship('covers', foreign_keys='covers.sent_id', backref='sent_book')
    covers_received = db.relationship('covers', foreign_keys='covers.received_id', backref='received_book')
    listing = db.relationship('listing', foreign_keys='listing.bookid', backref='book')

    def __repr__(self):
        return f"<Book {self.title} by {self.author}>"


# Message Table
class Message(db.Model):
    __tablename__ = 'Message'

    messageid = db.Column(db.Integer, primary_key=True)
    contents = db.Column(db.String(1000), nullable=False)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationship to sends
    sends = db.relationship('sends', foreign_keys='sends.messageid', backref='sent_message')


    def __repr__(self):
        return f"<Message {self.messageid} from {self.senderid} to {self.recieverid}>"


# Transaction Table
class Transaction(db.Model):
    __tablename__ = 'Transaction'

    transactionid = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(255), nullable=False)
    status = db.Column(db.String(50), nullable=False)
    date = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationship to tables
    initiate = db.relationship('initiate', foreign_keys='initiate.transactionid', backref='transaction', lazy=True)
    covers_sent = db.relationship('covers', foreign_keys='covers.transactionid', backref='sent_transaction')

    def __repr__(self):
        return f"<Transaction {self.transactionid} between {self.senderid} and {self.recieverid}>"

# sends Table
class sends(db.Model):
    __tablename__ = 'sends'

    senderid = db.Column(db.Integer, db.ForeignKey('User.user_id'), primary_key=True)
    receiverid = db.Column(db.Integer, db.ForeignKey('User.user_id'), primary_key=True)
    messageid = db.Column(db.Integer, db.ForeignKey('Message.messageid'), primary_key=True)

    def __repr__(self):
        return f"<sends user_id {self.user_id} messageid {self.messageid}>"

# listing Table
class listing(db.Model):
    __tablename__ = 'listing'

    ownerid = db.Column(db.Integer, db.ForeignKey('User.user_id'), primary_key=True)
    bookid = db.Column(db.String(13), db.ForeignKey('Book.bookid'), primary_key=True)

    def __repr__(self):
        return f"<listing user_id {self.user_id} bookid {self.bookid}>"


# covers Table
class covers(db.Model):
    __tablename__ = 'covers'

    transactionid = db.Column(db.Integer, db.ForeignKey('Transaction.transactionid'), primary_key=True)
    sent_id = db.Column(db.String(13), db.ForeignKey('Book.bookid'), primary_key=True)
    received_id = db.Column(db.String(13), db.ForeignKey('Book.bookid'), primary_key=True)

    def __repr__(self):
        return f"<covers transactionid {self.transactionid} bookid {self.bookid}>"


# initiate Table
class initiate(db.Model):
    __tablename__ = 'initiate'

    transactionid = db.Column(db.Integer, db.ForeignKey('Transaction.transactionid'), primary_key=True)
    senderid = db.Column(db.Integer, db.ForeignKey('User.user_id'), primary_key=True)
    receiverid = db.Column(db.Integer, db.ForeignKey('User.user_id'), primary_key=True)

    def __repr__(self):
        return f"<initiate transactionid {self.transactionid} user_id {self.user_id}>"
