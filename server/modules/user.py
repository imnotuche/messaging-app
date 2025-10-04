#import user defined modules
from modules import database

#this class represents the user
#think of it like a store but in the backend
class user:
    
    #constructor
    def __init__ (self, id):
        self.id=id
    
    #load data from db
    def load_user(self):
        conn=None
        conn, cursor=database.connect()
        try:
            cursor.execute(
                "SELECT * FROM users WHERE id = ?",
                (self.id,)
            )
            
            person=cursor.fetchone()
            #now populate attributes
            self.name=person["name"]
            self.username=person["username"]
            self.email=person["email"]
            self.bio=person["bio"]
            self.online=person["online"]
            self.profile=person["profile"]
        
        except Exception as e:
            print(f"Error: {e}  source: {__name__}")
            
        finally:
            if conn:
                conn.close()
    
    #dictionary mapping string to attributes
    attributes={
        "name": "name",
        "username": "username",
        "email": "email",
        "bio": "bio",
        "online": "online",
        "profile": "profile"
    }
    
    #to update in db and also attributes
    def update(self, key, value):
        if key in self.attributes:
            
            try:
                #update in db
                conn=None
                conn, cursor=database.connect()
                cursor.execute(
                    f'''
                        UPDATE users 
                        SET {key} = ?
                        WHERE id = ?
                    ''',
                    (
                        value,
                        self.id
                    )
                )
                conn.commit()
                #update class attribute
                setattr(self, key, value)
            
            except Exception as e:
                print(f"Error: {e}  source: {__name__}")
                
            finally:
                if conn:
                    conn.close()
        
        else:
            raise Exception("Attribute does not exist")