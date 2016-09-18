'use strict';

const db = require('./database.js');
const img = require('./image.js');
const utils = require('./utils.js');

module.exports = {
    add: function(httpRequest, httpResponse) {
        let data = JSON.parse(httpRequest.body);
        if (!(data.report_id && data.floorplan_id)) {
            //TODO: implement error if their shit isn't defined
            console.log(`Bad JSON`);
            httpResponse.send('Bad JSON, make this message better later');
            return;
        }

        data.id = utils.newId();
        data.is_default = false;

        if (httpRequest.files) {
            const result = img.storeImage(httpRequest.files.image.path, 'item', data.id);

            if (result.err) {
                console.log(`Creating new logo failed: ${result.err}`);
                httpResponse.send(result.err);
                return;
            }

            data.image_path = result.path;
        }

        db.query('INSERT INTO items SET ?', data, function(err) {
            if (err) {
                console.log(`Create new item failed: ${err}`);
                httpResponse.send(err);
                return;
            }
        });
    },
    get: function(httpRequest, httpResponse) {
        const id = httpRequest.params.id;

        db.query('SELECT * FROM items WHERE id = ?', id, function(err, rows) {
            if (err) {
                console.log(`Get items failed: ${err}`);
                httpResponse.send(err);
                return;
            }

            httpResponse.setHeader('Content-Type', 'application/json');
            httpResponse.send(rows[0]);
        });
    },
    update: function(httpRequest, httpResponse) {
        const id = httpRequest.params.id;
        const data = JSON.parse(httpRequest.body);

        if (httpRequest.files) {
            const result = img.storeImage(httpRequest.files.image.path, 'item', data.id);

            if (result.err) {
                console.log(`Creating new logo failed: ${result.err}`);
                httpResponse.send(result.err);
                return;
            }

            data.image_path = result.path;
        }

        db.query('UPDATE items SET * WHERE id = ?', [data, id], function(err) {
            if (err) {
                console.log(`Update item failed: ${err}`);
                httpResponse.send(err);
                return;
            }

            httpResponse.setHeader('Content-Type', 'application/json');
            httpResponse.send(data)
        });
    },
    remove: function(httpRequest, httpResponse) {
        const id = httpRequest.params.id;
        const data = JSON.parse(httpRequest.body);

        if (data.is_default) {
            httpResponse.send('Cannot delete default item.');
            return;
        }

        db.query('DELETE FROM items WHERE id = ?', id, function(err) {
            if (err) {
                console.log(`Delete item failed: ${err}`);
                httpResponse.send(err);
                return;
            }

            httpResponse.send('Delete item successful');
        });
    }
}
