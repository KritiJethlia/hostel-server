const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
var { Users } = require('./models/Users');
var { GroupList } = require('./models/GroupList');
var { Notification } = require('./models/Notifications');
var { Wing } = require('./models/Wing');
var { Timer } = require('./models/Timer');
var connection = require('./config.js').mongooseConnection;

var app = express();
app.use(cors({ origin: true, credentials: true }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

mongoose.set('useCreateIndex', true);
mongoose.set('useUnifiedTopology', true);
mongoose.set('useFindAndModify', false);
let DATABASE_CONNECTION = connection;

mongoose.connect(DATABASE_CONNECTION, { useNewUrlParser: true });

app.get("/getGroup", (req, res) => {
	GroupList.find(function (err, finalgrps) {
		if (err) {
			console.log(err);
		}
		else {
			res.json(finalgrps);
			// console.log(finalgrps);
		}

	})
});
app.get("/getUsers", (req, res) => {
	Users.find(function (err, allUsers) {
		if (err) {
			console.log(err);
		}
		else {
			res.json(allUsers);
		}

	})
});

app.get("/getWing", (req, res) => {
	Wing.find(function (err, allWings) {
		if (err) {
			console.log(err);
			res.json(err);
		}
		else {
			res.json(allWings);
			console.log(allWings);
		}
	})
});

app.post("/signIn", (req, res) => {
	var { username, password } = req.body;
	console.log(username);
	Users.findOne({ username: username, password: password }, (err, result) => {
		if (err)
			res.send(err);
		else {
			res.send(result);
			console.log(result);
		}
	});
});

app.post("/register", (req, res) => {
	var { name, username, email, password, leader, member } = req.body;
	var user = { name: name, username: username, email: email, password: password, leader: leader, member: member, wing: "null" };
	Users.create(user, (err, obj) => {
		if (err) {
			console.log(err);
			res.send({ status: false, error: err })
		}
		else {
			res.send(obj);
		}
	});
});

app.post("/getRole", (req, res) => {
	var { username } = req.body;
	Users.findOne({ username: username }, (err, obj) => {
		if (err) {
			console.log(err);
			res.status(404).json(err);
		}
		else
			res.send(obj);
	});
});

app.post("/setLeader", (req, res) => {
	var { username } = req.body;
	console.log('username is', username);
	Users.findOneAndUpdate({ username: username }, { $set: { gname: username} }, { new: true }, (err, obj) => {
		if (err)
			res.status(404).json(err);
		else {
			Users.findOneAndUpdate({ username: username }, { $set: { leader:true} }, { new: true }, (err, obj)=>{
				if(err)
				res.status(404).json(err);
				else
				var group = {
					gname: username,
					member: 1,
					grpid: obj._id,
				}
				GroupList.create(group, (error,object)=>{
					if(error)
						res.status(404).json(error);
					else	
					res.json(object);
				});
			}
			)
		}}
		);
});

app.post("/setMember", (req, res) => {
	var { username } = req.body;
	console.log('username is', username);
	Users.findOneAndUpdate({ username: username }, { $set: { member: true } }, { new: true }, (err, obj) => {
		if (err)
			res.status(404).json(err);
		else
			res.json(obj);
	});
});


app.post("/createNotif", (req, res) => {
	var { fromGname, toUsername, fromUsername, toGname } = req.body;
	// console.log('username is',username);
	var notif = { fromgname: fromGname, tousername: toUsername, fromusername: fromUsername, togname: toGname }
	Notification.find(notif,(err,obj)=>{
		if(err)
			res.status(404).json(err);
		else{
			if(obj.length===0){
				console.log('yes');
				Notification.create(notif, (error, object) => {
					if (error)
						res.status(404).json(error);
					else
						res.json(object);
				})
			}
			else{
				res.status(200).json({
					code: 123,
					message: 'Notif already exists',
				})
			}
		}
	})
});

app.post("/getNotifsformember", (req, res) => {
	var { username } = req.body;
	// console.log('username is',username);
	Notification.find({ tousername: username }, (err, obj) => {
		if (err)
			res.status(404).json(err);
		else {
			console.log(obj)
			res.json(obj);
		}
	});
});

app.post("/getNotifsforLeader", (req, res) => {
	var { username } = req.body;
	// console.log('username is',username);
	Notification.find({ togname: username }, (err, obj) => {
		if (err)
			res.status(404).json(err);
		else
			res.json(obj);
	});
});

app.post("/getUsers", (req, res) => {
	var { leader } = req.body;
	Users.find({ leader: leader }, (err, obj) => {
		if (err)
			res.status(404).json(err);
		else
			res.json(obj);
	});
});

app.post("/getGroups", (req, res) => {
	var { gname, grpid, members, color } = req.body;
	var grp = { gname: gname, grpid: grpid, members: members, color: color };
	GroupList.create(grp, (err, obj) => {
		if (err)
			res.status(404).json(err);
		else
			res.json(obj);
	});
});

app.post("/getOneUser", (req, res) => {
	var { username } = req.body;
	Users.find({ username: username }, (err, obj) => {
		if (err)
			res.status(404).json(err);
		else
			res.json(obj);
	});
});

app.post("/setSelected", (req, res) => {
	var { bhawan, floor, wingNo } = req.body;
	console.log(bhawan, wingNo, floor);
	Wing.findOneAndUpdate({ bhawan: bhawan, floor: floor, wingNo: wingNo }, { $set: { status: "selected" } }, { new: true }, (err, obj) => {
		console.log(obj);
		if (err)
			res.status(404).json(err);
		else
			res.json(obj);
	})
})

app.post("/selectWing", (req, res) => {
	var { wing, user } = req.body;
	console.log("hiii" + wing + user);
	Users.findOneAndUpdate({ username: user }, { $set: { wing: wing } }, (err, obj) => {
		console.log(obj);
		if (err)
			res.status(404).json(err);
		else
			res.json(obj);
	})
})

app.post("/setBlocked", (req, res) => {
	var { bhawan, floor, wingNo } = req.body;
	Wing.findOneAndUpdate({ bhawan: bhawan, floor: floor, wingNo: wingNo }, { $set: { status: "blocked" } }, { new: true }, (err, obj) => {
		console.log(obj);
		if (err)
			res.status(404).json(err);
		else
			res.json(obj);
	})
})

app.post("/setFree", (req, res) => {
	var { bhawan, floor, wingNo } = req.body;
	Wing.findOneAndUpdate({ bhawan: bhawan, floor: floor, wingNo: wingNo }, { $set: { status: "free" } }, { new: true }, (err, obj) => {
		console.log(obj);
		if (err)
			res.status(404).json(err);
		else
			res.json(obj);
	})
})

app.post("/notifsReq", (req, res) => {
	var { fromGname, toUsername, fromUsername, toGname, accept } = req.body;
	console.log('fromGname', fromGname)
	if (fromGname !== undefined && toUsername !== undefined) {
		if (accept === true) {
			Notification.findOneAndUpdate({ fromgname: fromGname, tousername: toUsername }, { $set: { colour: "#00ff00", disabled: true } }, { new: true }, (err, obj) => {
				console.log(obj);
			})
			Users.findOneAndUpdate({ username: toUsername }, { $set: { gname: fromGname } }, { new: true }, (err, obj) => {
				console.log(obj);
				if (err)
					res.status(404).json(err);
				else
					res.json(obj);
			})
		}
		else {
			Notification.findOneAndUpdate({ fromgname: fromGname, tousername: toUsername }, { $set: { colour: "#dc143c", disabled: true } }, { new: true }, (err, obj) => {
				console.log(obj);
				if (err)
					res.status(404).json(err);
				else
					res.json(obj);
			})
		}
	}
	else
		if (fromUsername !== undefined && toGname !== undefined) {
			if (accept === true) {
				Notification.findOneAndUpdate({ fromusername: fromUsername, togname: toGname }, { $set: { colour: "#00ff00", disabled: true } }, { new: true }, (err, obj) => {
					console.log(obj);
				})
				Users.findOneAndUpdate({ username: fromUsername }, { $set: { gname: toGname } }, { new: true }, (err, obj) => {
					console.log(obj);
					if (err)
						res.status(404).json(err);
					else
						res.json(obj);
				})
			}
			else {
				Notification.findOneAndUpdate({ fromusername: fromUsername, togname: toGname }, { $set: { colour: "#dc143c", disabled: true } }, { new: true }, (err, obj) => {
					console.log(obj);
					if (err)
						res.status(404).json(err);
					else
						res.json(obj);
				})
			}
		}
})

app.post('/timer', (req, res) => {
	var time = {
		countdown: new Date(),
		updatedAt: new Date(),
		for:'initial setup',
	}
	Timer.create(time, (err, obj) => {
		if (err)
			res.status(500).json(err);
		else
			res.status(201).json({ id: obj.id });
	})
})

app.get('/timer/:id', (req, res) => {
	var id = req.params.id;
	Timer.findById(id, (err, obj) => {
		if (err)
			res.status(500).json(err);
		else
			res.status(200).json(obj);
	})
})

app.post('/timer/:id',(req,res)=>{
	var id = req.params.id;
	var countdown = new Date(req.body.setTime);
	var sprint = req.body.sprint;
	Timer.findByIdAndUpdate(id,{
		countdown: countdown,
		updatedAt: new Date(),
		for: sprint,
	},(err,obj)=>{
		if(err)
			res.status(500).json(err);
		else
			res.json(obj);	
	})
})

app.get('/', (req, res) => {
	res.status(200).json('Server is up and running')
})

app.listen(process.env.PORT || 5000, () => {
	console.log(`listening on port ${process.env.PORT}`);
});