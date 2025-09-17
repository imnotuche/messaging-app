#import inbuilt modules
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os

def send_mail(receiver, subject, body):
    sender=str(os.getenv("EMAIL")) #senders email
    password=str(os.getenv("EMAIL_APP_PASSWORD")) #email app password

    #message construction
    msg = MIMEMultipart("alternative")
    msg["From"] = f"Andora <{sender}>"
    msg["To"] = receiver
    msg["Subject"] = subject

    #plain text to show with clients that dont support html
    plain_text=(
        "Hello!\n\n"
        "We’ve sent you a verification code for your Andora account.\n\n"
        "If your email client doesn’t display any 6-digit code in this message, "
        "please please use a different one.\n\n"
    )

    #attach content to the message object
    msg.attach(MIMEText(plain_text, "plain"))
    msg.attach(MIMEText(body, "html")) 

    with smtplib.SMTP("smtp.gmail.com", 587) as server:
        server.starttls()
        server.login(sender, password)
        server.sendmail(sender, receiver, msg.as_string())


