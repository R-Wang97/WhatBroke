const db = require('./database.js');
const crypto = require('crypto');
const config = require('./config.js');
const token = require('./token.js');

function comparePasswordWithHash(password, hash, salt, iterations) {
    return crypto.pbkdf2Sync(password, salt, iterations, config.Password.KeyLength, config.Password.HashFunction) == hash;
}

module.exports = {

    User: class {
        constructor(username, password) {
            this.username = username;
            this.salt = crypto.randomBytes(SALT_LENGTH);
            this.iterations = ITERATIONS;
            this.hash = crypto.pbkdf2Sync(password, this.salt, this.iterations, config.Password.KeyLength, config.Password.HashFunction);
        }

        toObj() {
            return {
                username: this.username,
                hash: this.hash,
                salt: this.salt,
                iterations: this.iterations
            }
        }
    },

    create: function(httpRequest, httpResponse) {
        let data = JSON.parse(httpRequest.body);

        let user = new User(data.username, data.password)

        db.conn.query('INSERT INTO users SET ?', user.toObj(), function(err) {
            if (err) {
                console.log(`Create new user failed: ${err}`);
                httpResponse.send(err);
                return;
            }
        });

        httpResponse.setHeader('Content-Type', 'application/json');
        httpResponse.send(user);
    },
    login: function(httpRequest, httpResponse) {
        let data = JSON.parse(httpRequest.body);

        const username = data.username;
        const password = data.password;
        
        let user = null;
        db.conn.query('SELECT * FROM users WHERE username = ?', username, function(err, rows) {
            if (err) {
                console.log(`Login failed: ${err}`);
                httpResponse.send(err);
                return;
            } else {
                user = rows[0];
            }
        });

        let token = null;
        if (comparePasswordWithHash(password, user.hash, user.salt, user.iterations)) {
            token = token.newToken(user.username);

            db.conn.query('INSERT INTO tokens SET ?', token, function(err) {
                if (err) {
                    console.log(`Login failed: ${err}`);
                    httpResponse.send(err);
                    return;
                }
            });

            httpResponse.setHeader('Content-Type', 'application/json');
            httpResponse.send(token);
        } else {
            httpResponse.send(err);
        }
    },
    logout: function(httpRequest, httpResponse) {
        let data = JSON.parse(httpRequest.body);

        token = data.token;

        db.conn.query('DELETE FROM tokens WHERE token = ?', token, function(err) {
            if (err) {
                console.log(`Logout failed: ${err}`);
                httpResponse.send(err);
                return;
            }
        });

        httpResponse.send('Successfully logged out.');
    },
    delete: function(httpRequest, httpResponse) {
        let data = JSON.parse(httpRequest.body);

        token = data.token;
        let username = '';

        db.conn.query('SELETE FROM tokens WHERE token = ?', token, function(err, rows) {
            if (err) {
                console.log(`Delete failed: ${err}`);
                httpResponse.send(err);
                return;
            } else {
                username = rows[0].username;
            }
        });

        db.conn.query('DELETE FROM tokens WHERE username = ?', username, function(err) {
            if (err) {
                console.log(`Delete failed: ${err}`);
                httpResponse.send(err);
                return;
            }
        });

        db.conn.query('DELETE FROM users WHERE username = ?', username, function(err) {
            if (err) {
                console.log(`Delete failed: ${err}`);
                httpResponse.send(err);
                return;
            }
        });

        httpResponse.send('Successfully deleted user.');
    }
}