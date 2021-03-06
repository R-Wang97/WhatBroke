'use strict';
const express = require('express');
const bodyParser = require('body-parser')
const app = express();
app.use(bodyParser.json());

const config = require('./api/config.js');

const userApi = require('./api/user.js');
const userRouter = express.Router({mergeParams: true});
userRouter.route('/create').post(userApi.create);
userRouter.route('/login').post(userApi.login);
userRouter.route('/logout').post(userApi.logout);
userRouter.route('/delete').post(userApi.delete);
userRouter.route('/logo').post(userApi.logo);
userRouter.route('/blurb').post(userApi.blurb);

const floorPlanApi = require('./api/floorplan.js');
const floorPlanRouter = express.Router({mergeParams: true});
floorPlanRouter.route('/add').post(floorPlanApi.add);
floorPlanRouter.route('/delete').post(floorPlanApi.delete);
floorPlanRouter.route('/list').post(floorPlanApi.list);
floorPlanRouter.route('/:id/show').post(floorPlanApi.show);

const roomApi = require('./api/room.js');
const roomRouter = express.Router({mergeParams: true});
roomRouter.route('/:floorplan_id/generate').post(roomApi.generate);
roomRouter.route('/list').post(roomApi.list);
roomRouter.route('/:id/get').post(roomApi.get);
roomRouter.route('/:id/delete').post(roomApi.delete);

const itemApi = require('./api/item.js');
const itemRouter = express.Router({mergeParams: true});
itemRouter.route('/add').post(itemApi.add);
itemRouter.route('/:id').get(itemApi.get);
itemRouter.route('/:id/update').post(itemApi.update);
itemRouter.route('/:id/remove').post(itemApi.remove);

const printoutApi = require('./api/printout.js');
const printoutRouter = express.Router({mergeParams: true});
printoutRouter.route('/room/:id').post(printoutApi.produce);
printoutRouter.route('/report').post(printoutApi.reportAll);
printoutRouter.route('/report/:id').post(printoutApi.report);

const analyticsApi = require('./api/analytics.js');
const analyticsRouter = express.Router({mergeParams: true});
analyticsRouter.route('/heatmap').get(analyticsApi.getHeatMap);
analyticsRouter.route('/average').get(analyticsApi.getAverage);

const landlordRouter = express.Router({mergeParams: true});
landlordRouter.use('/floorplan', floorPlanRouter);
landlordRouter.use('/room', roomRouter);
landlordRouter.use('/item', itemRouter);
landlordRouter.use('/printout', printoutRouter);
landlordRouter.use('/analytics', analyticsRouter);

const reportApi = require('./api/report.js');
const reportRouter = express.Router({mergeParams: true});
reportRouter.route('/').get(reportApi.get);
reportRouter.route('/update').post(reportApi.update);
reportRouter.route('/submit').post(reportApi.submit);

const apiRouter = express.Router();
apiRouter.use('/user', userRouter);
apiRouter.use('/landlord', landlordRouter);
apiRouter.use('/:id', reportRouter);

app.use('/api', apiRouter);
app.use('/', express.static(`${__dirname}/public`));
app.use('/admin', express.static(`${__dirname}/public/admin`))

const port = config.ServerPort;
const server = app.listen(port);
console.log(`Listening on port ${port}`);
