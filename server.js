const express = require('express');
const cors = require('cors');
const knex = require('knex');
const session = require('express-session');
const { request, response } = require('express');
const bcrypt = require('bcrypt-nodejs')
const {spawn} = require('child_process');
const { SSL_OP_SSLEAY_080_CLIENT_DH_BUG } = require('constants');


const db = knex({
    client: 'pg',
    connection: {
        host: '127.0.0.1',
        user: 'postgres',
        password: 'root',
        database: 'journie'
    }
});

const app = express()

app.use(express.json());
app.use(cors());
app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
}))


/*
End-Point: base-url/register

End-point to enable user registeration.
Accepts: firstName, lastName, email, password.
Returns: user profile.
*/ 

app.post('/register', (req, res) => {
    const today = new Date().toISOString();
    const {firstName, lastName, email, password} = req.body;
    console.log(password);
    db('user_account')
    .returning('*')
    .insert({
        firstname: firstName,
        lastname: lastName,
        email: email,
        password: password,
        dateofjoin: today
    })
    .then(user => res.json(user[0]))
    .catch(err => res.status(400).json('Unable to Register'))
})


/*
End-Point: base-url/signin

End-point to enable user signin.
Accepts: email, password.
Returns: user profile.
*/ 


app.post('/signin', (req, res) => {
    const {email, password} = req.body;
    if(!email || !password){
        return res.status(400).json("Please fill all required fields")
    }
    db.select('*').from('user_account').where('email', '=', email)
    .then(data => {
            db.select('*').from('user_account')
            .where('password', '=', password)
            .then(user => res.json(user[0]))
            .catch(err => res.status(400).json('Incorrect Password'))
        })
    .catch(err=>res.status(400).json("Incorrent Credentials"))

})


/*
End-Point: base-url/

Called right after user sign-in, accepts user id and 
returns all current tasks of the user.
*/ 

app.post('/', (req, res) => {
    const userid = req.body.userid;
    const today = new Date().toISOString();
    const today_date = today.slice(0,10);

    db.select('*')
    .from('today_task')
    .where({
        userid: userid,
        entrydate: today_date
    })
    .then(taskdata => res.json(taskdata))
    .catch(err => res.status(400).json(err))
})

/*
End-Point: base-URL/welcome
End-point for welcome messages for user upon signin.
Accepts: User id
Responds: User profile.
*/

app.post('/welcome', (req, res) => {
    const id = req.body.id;
    console.log(id);
    if(!id){
        return res.status(500).json("User Id does not exists");
    }
    db.select('*').from('user_account')
    .where({ 
        id:id
    })
    .then(user => res.json(user[0]))
    .catch(err => res.status(501).json("User Id Not Found"))
})

/*
End-Point: base-URL/addToday
To add today tasks
Accepts: userid, taskType, taskTitle, taskDesc
Responds: All today tasks for the day.
*/
 
app.post('/addToday', (req, res) => {
    const {userid, taskType, taskTitle, taskDesc} = req.body;
    const today = new Date().toISOString();
    const today_date = today.slice(0,10)
    db.insert({
            userid: userid,
            tasktype: taskType,
            tasktitle: taskTitle,
            taskdesc: taskDesc,
            entrydate: today_date
        })
        .into('today_task')
        .returning('*')
        .then(taskdata => {
            db('today_task')
            .select('*')
            .where({
                userid: userid,
                entrydate: today_date
            })
            .then(todaytaskData => res.json(todaytaskData))
            .catch(err => res.status(400).json("Today tasks not found"))
        })
})

/*
End-Point: base-URL/doneTodayTask
To mark today tasks as done.

End-Point: base-URL/notdoneTodayTask
To mark today task as not done.

End-Point: base-URL/deleteTodayTask
To delete today task.
*/

app.post('/checkTaskStatus', (req, res) => {
    console.log("For taskDone endpoint, taskid is:", req.body.taskid);
    db('today_task')
    .where({
        todaytaskid: req.body.taskid
    })
    .select('isdone')
    .returning('isdone')
    .then(todayTaskStatus => res.json(todayTaskStatus[0]))
    .catch(err => res.status(400).json(err))
})

app.post('/doneTodayTask', (req, res) => {
    console.log("For taskDone endpoint, taskid is:", req.body.taskid);
    db('today_task')
    .where({
        todaytaskid: req.body.taskid
    })
    .update({
        isdone: 1
    })
    .returning('isdone')
    .then(todayTaskStatus => res.json(todayTaskStatus))
    .catch(err => res.status(400).json(err))
})

app.post('/notdoneTodayTask', (req, res) => {
    console.log("For taskNotDone endpoint, taskid is:", req.body.taskid);
    db('today_task')
    .where({
        todaytaskid: req.body.taskid
    })
    .update({
        isdone: 0
    })
    .returning('isdone')
    .then(todayTaskStatus => res.json(todayTaskStatus))
    .catch(err => res.status(400).json(err))
})

app.post('/deleteTodayTask', (req, res) => {
    console.log("Task id is:", req.body.taskid)
    db('today_task')
    .where({
        todaytaskid: req.body.taskid
    })
    .del()
    .then(res.json("Deleted successfully."))
    .catch(err => res.status(404).json("Count not delete"))

})


/*
End-Point: addSchedule
To add scheduled tasks.

Accepts: userid, taskType, taskTitle, taskDesc and scheduled date of the task.
Responds: All today tasks for the day.
*/

app.post('/addSchedule', (req, res) => {
    const {userid, taskTitle, taskDesc, scheduleDate} = req.body;
    const today = new Date().toISOString();
    const today_date = today.slice(0,10)
    db.insert({
            userid: userid,
            tasktitle: taskTitle,
            taskdesc: taskDesc,
            entrydate: today_date,
            scheduled_date: scheduleDate
        })
        .into('schedule_task')
        .returning('*')
        .then(taskdata => {
            db('schedule_task')
            .select('*')
            .where({
                userid: userid
            })
            .then(todaytaskData => res.json(todaytaskData))
            .catch(err => res.status(400).json("No task scheduled for today."))
        })
})


app.post('/scheduleTask', (req, res) => {
    const userid = req.body.userid;
    const today = new Date().toISOString();
    const today_date = today.slice(0,10);

    db.select('*')
    .from('schedule_task')
    .where({
        userid: userid
    })
    .then(taskdata => res.json(taskdata))
    .catch(err => res.status(400).json(err))
})

app.post('/scheduleCheckTaskStatus', (req, res) => {
    console.log("For taskDone endpoint, taskid is:", req.body.taskid);
    db('schedule_task')
    .where({
        todaytaskid: req.body.taskid
    })
    .select('isdone')
    .returning('isdone')
    .then(todayTaskStatus => res.json(todayTaskStatus[0]))
    .catch(err => res.status(400).json(err))
})

app.post('/doneScheduleTask', (req, res) => {
    console.log("For taskDone endpoint, taskid is:", req.body.taskid);
    db('schedule_task')
    .where({
        scheduledtaskid: req.body.taskid
    })
    .update({
        isdone: 1
    })
    .returning('isdone')
    .then(todayTaskStatus => res.json(todayTaskStatus))
    .catch(err => res.status(400).json(err))
})

app.post('/notdoneScheduleTask', (req, res) => {
    console.log("For taskNotDone endpoint, taskid is:", req.body.taskid);
    db('schedule_task')
    .where({
        scheduledtaskid: req.body.taskid
    })
    .update({
        isdone: 0
    })
    .returning('isdone')
    .then(todayTaskStatus => res.json(todayTaskStatus))
    .catch(err => res.status(400).json(err))
})

app.post('/deleteScheduleTask', (req, res) => {
    console.log("Task id is:", req.body.taskid)
    db('schedule_task')
    .where({
        scheduledtaskid: req.body.taskid
    })
    .del()
    .then(res.json("Deleted successfully."))
    .catch(err => res.status(404).json("Count not delete"))

})



/*Daily Tasks*/


app.post('/addDaily', (req, res) => {
    const {userid, taskType, taskTitle, taskDesc} = req.body;
    const today = new Date().toISOString();
    const today_date = today.slice(0,10)
    db.insert({
            userid: userid,
            tasktype: taskType,
            tasktitle: taskTitle,
            taskdesc: taskDesc,
            entrydate: today_date
        })
        .into('daily_task')
        .returning('*')
        .then(todaytaskData => res.json(todaytaskData))
        .catch(err => res.status(400).json(err))
})

app.post('/dailyTask', (req, res) => {
    const userid = req.body.userid;
    const today = new Date().toISOString();
    const today_date = today.slice(0,10);

    db.select('*')
    .from('daily_task')
    .where({
        userid: userid
    })
    .then(taskdata => res.json(taskdata))
    .catch(err => res.status(400).json(err))
})

app.post('/dailyCheckTaskStatus', (req, res) => {
    const today = new Date().toISOString();
    const today_date = today.slice(0,10);
    db('daily_task_status')
    .where({
        userid: req.body.userid,
        taskdate: today_date
    })
    .select('isdone')
    .returning('isdone')
    .then(todayTaskStatus => res.json(todayTaskStatus[0]))
    .catch(err => res.json(err))
})

app.post('/doneDailyTask', (req, res) => {
    const today = new Date().toISOString();
    const today_date = today.slice(0,10);
    console.log("For taskDone endpoint, taskid is:", req.body.taskid);
    db('daily_task_status')
    .insert({
        dailytaskid: req.body.taskid,
        userid: req.body.userid,
        isdone: 1,
        taskdate: today_date
    })
    .returning('isdone')
    .then(dailyTaskStatus => res.json(dailyTaskStatus))
    .catch(updateData => {
        console.log(updateData)
        db('daily_task_status')
        .update({
            isdone: 1
        })
        .where({
            taskdate: today_date,
            dailytaskid: req.body.taskid
        })
        .returning('isdone')
        .then(updateData => res.json(updateData))
        .catch(err => res.json(err))
    })
})

app.post('/notdoneDailyTask', (req, res) => {
    const today = new Date().toISOString();
    const today_date = today.slice(0,10);
    console.log("For taskNotDone endpoint, taskid is:", req.body.taskid);
    db('daily_task_status')
    .where({
        dailytaskid: req.body.taskid,
        taskdate: today_date
    })
    .update({
        isdone: 0
    })
    .returning('isdone')
    .then(dailyTaskStatus => res.json(dailyTaskStatus))
    .catch(err => res.status(400).json(err))
})

app.post('/deleteDailyTask', (req, res) => {
    console.log("Task id is:", req.body.taskid)
    db('daily_task_status')
    .where({
        dailytaskid: req.body.taskid
    })
    .del()
    .then(deleteTask => {
        db('daily_task')
        .where({
            dailytaskid: req.body.taskid
        })
        .del()
        .then(res.json("Successfully Deleted task"))
        .catch(res.json("Could not delete task."))
    })
})



/*
Total and Score End-Points
___Total End-Point: Respond with total number of tasks by particular user for current date.
            Arg: userid
            Response: {
                        count: "5"

                      }
    
__Score End-Point: Responds with total number of tasks marked as done by user for current date.

            Arg: userid
            Response: {
                        count: "3"
                      }

*/

/*
End-Point: /todayTaskTotal
Action: Total no. of today tasks.

End-Point: /todayTaskDone
Action: Total no. of today tasks done.
 */
app.post('/todayTaskTotal', (req, res) => {
    const userid = req.body.userid;
    const today = new Date().toISOString();
    const today_date = today.slice(0,10);

    db('today_task')
    .count('isdone')
    .where({
        userid: userid,
        entrydate: today_date
    })
    .then(count =>res.json(count[0]))
    .catch(err => res.json(err))
})

app.post('/todayTaskDone', (req, res) => {
    const userid = req.body.userid;
    const today = new Date().toISOString();
    const today_date = today.slice(0,10);

    db('today_task')
    .count('isdone')
    .where({
        userid: userid,
        entrydate: today_date,
        isdone: 1
    })
    .then(count =>res.json(count[0]))
    .catch(err => res.json(err))
})

app.post('/dailyTaskTotal', (req, res) => {
    const userid = req.body.userid;
    const today = new Date().toISOString();
    const today_date = today.slice(0,10);
    
    db('daily_task')
    .count('dailytaskid')
    .where({
        userid: userid,
    })
    .then(count =>res.json(count[0]))
    .catch(err => res.json(err))
})

app.post('/dailyTaskDone', (req, res) => {
    const userid = req.body.userid;
    const today = new Date().toISOString();
    const today_date = today.slice(0,10);
    
    db('daily_task_status')
    .count('isdone')
    .where({
        userid: userid,
        taskdate: today_date,
        isdone: 1
    })
    .then(count =>res.json(count[0]))
    .catch(err => res.json(err))
})

app.post('/scheduledTaskTotal', (req, res) => {
    const userid = req.body.userid;
    const today = new Date().toISOString();
    const today_date = today.slice(0,10);
    
    db('schedule_task')
    .count('isdone')
    .where({
        userid: userid,
    })
    .then(count =>res.json(count[0]))
    .catch(err => res.json(err))
})

app.post('/scheduledTaskDone', (req, res) => {
    const userid = req.body.userid;
    const today = new Date().toISOString();
    const today_date = today.slice(0,10);
    
    db('schedule_task')
    .count('isdone')
    .where({
        userid: userid,
        isdone: 1
    })
    .then(count =>res.json(count[0]))
    .catch(err => res.json(err))
})
 

/*
Saving and viewing journal entries.

/editor
Accepts: userid
Response: Journal entry for current date.

/editorSave
Accepts: userid, saveData
Action: Saves journal data in database for current date.
*/

app.post('/editor', (req, res) => {
    const today = new Date().toISOString();
    const today_date = today.slice(0,10);

    db('journal')
    .select('journaldata')
    .where({
        userid: req.body.userid,
        entrydate: today_date
    })
    .returning('journaldata')
    .then(showData => res.json(showData[0]))
    .catch(err => res.json(err))
})

app.post('/editorSave', (req, res) => {
    const {userid, saveData}  = req.body;
    const today = new Date().toISOString();
    const today_date = today.slice(0,10);
    var entryExists = false;

    db('journal')
    .insert({
        userid: userid,
        journaldata: saveData,
        entrydate: today_date
    })
    .returning('*')
    .then(journalData => res.json(journalData))   
    .catch(updateData => {
        db('journal')
        .update({
            journaldata: saveData
        })
        .where({
            entrydate: today_date
        })
        .returning('journaldata')
        .then(updateJournal => res.json(updateJournal))
        .catch(err => res.json("No Data Exists"))
    })
})


/*
Overview
*/
/*app.post('/overviewTodayTask', (req, res) => {
    const viewDate  = req.body.viewDate;
    const userid = req.body.userid
    console.log("Datepicker Data", viewDate.slice(0,10))
    console.log("Datepicker UserID", userid)
    db('today_task')
    .where({
        userid: userid,
        entrydate: viewDate.slice(0,10)
    })
    .select('*')
    .returning('*')
    .then(overviewTodayTaskData => res.json(overviewTodayTaskData))
    .catch(err => res.json("No Data Exists"))
})*/

Date.prototype.addDays = function(days) {
    var date = new Date(this.valueOf());
    date.setDate(date.getDate() + days);
    return date;
}

app.post('/overviewTodayTask', (req, res) => {
    const viewDate1 = new Date(req.body.viewDate);
    overviewDate = viewDate1.addDays(1);
    const str_overviewDate = overviewDate.toISOString()
    const overviewEntryDate = str_overviewDate.slice(0,10)
    db('today_task')
    .where({
        userid: req.body.userid,
        entrydate: overviewEntryDate
    })
    .select('*')
    .returning('*')
    .then(overviewTodayTaskData => res.json(overviewTodayTaskData))
    .catch(err => res.json("No Data Exists"))
})

app.post('/overviewJournal', (req, res) => {
    const viewDate1 = new Date(req.body.viewDate);
    overviewDate = viewDate1.addDays(1);
    const str_overviewDate = overviewDate.toISOString()
    const overviewEntryDate = str_overviewDate.slice(0,10)
    console.log("User ID is:", req.body.userid)
    console.log("Dates are:", overviewEntryDate)
    db('journal')
    .where({
        userid: req.body.userid,
        entrydate: overviewEntryDate
    })
    .select('journaldata')
    .returning('journaldata')
    .then(overviewJournalData => res.json(overviewJournalData[0]))
    .catch(err => res.json(err))
})

app.post('/overviewTodayTaskTotal', (req, res) => {
    const userid = req.body.userid;
    const viewDate1 = new Date(req.body.viewDate);
    overviewDate = viewDate1.addDays(1);;
    const str_overviewDate = overviewDate.toISOString()
    const overviewEntryDate = str_overviewDate.slice(0,10)

    db('today_task')
    .count('isdone')
    .where({
        userid: userid,
        entrydate: overviewEntryDate
    })
    .then(count =>res.json(count[0]))
    .catch(err => res.json(err))
})

app.post('/overviewTodayTaskDone', (req, res) => {
    const userid = req.body.userid;
    const viewDate1 = new Date(req.body.viewDate);
    overviewDate = viewDate1.addDays(1);;
    const str_overviewDate = overviewDate.toISOString()
    const overviewEntryDate = str_overviewDate.slice(0,10)

    db('today_task')
    .count('isdone')
    .where({
        userid: userid,
        entrydate: overviewEntryDate,
        isdone: 1
    })
    .then(count =>res.json(count[0]))
    .catch(err => res.json(err))
})

app.post('/overviewDailyTaskTotal', (req, res) => {
    const userid = req.body.userid;
    const viewDate1 = new Date(req.body.viewDate);
    overviewDate = viewDate1.addDays(1);;
    const str_overviewDate = overviewDate.toISOString()
    const overviewEntryDate = str_overviewDate.slice(0,10)
    
    db('daily_task')
    .count('dailytaskid')
    .where({
        userid: userid,
    })
    .then(count =>res.json(count[0]))
    .catch(err => res.json(err))
})

app.post('/overviewDailyTaskDone', (req, res) => {
    const userid = req.body.userid;
    const viewDate1 = new Date(req.body.viewDate);
    overviewDate = viewDate1.addDays(1);;
    const str_overviewDate = overviewDate.toISOString()
    const overviewEntryDate = str_overviewDate.slice(0,10)
    
    db('daily_task_status')
    .count('isdone')
    .where({
        userid: userid,
        taskdate: overviewEntryDate,
        isdone: 1
    })
    .then(count =>res.json(count[0]))
    .catch(err => res.json(err))
})

app.post('/overviewScheduledTaskTotal', (req, res) => {
    const userid = req.body.userid;
    const viewDate1 = new Date(req.body.viewDate);
    overviewDate = viewDate1.addDays(1);;
    const str_overviewDate = overviewDate.toISOString()
    const overviewEntryDate = str_overviewDate.slice(0,10)
    
    db('schedule_task')
    .count('isdone')
    .where({
        userid: userid,
    })
    .then(count =>res.json(count[0]))
    .catch(err => res.json(err))
})

app.post('/overviewScheduledTaskDone', (req, res) => {
    const userid = req.body.userid;
    const viewDate1 = new Date(req.body.viewDate);
    overviewDate = viewDate1.addDays(1);;
    const str_overviewDate = overviewDate.toISOString()
    const overviewEntryDate = str_overviewDate.slice(0,10)
    
    db('schedule_task')
    .count('isdone')
    .where({
        userid: userid,
        isdone: 1
    })
    .then(count =>res.json(count[0]))
    .catch(err => res.json(err))
})

/*
Sentiment Analysis
*/




/*
let runPy = new Promise(function(success, nosuccess) {


    const { spawn } = require('child_process');
    const pyprog = spawn('python', ['./multi-node-tree.py', 4, 75, 4, 75, 1]);

    pyprog.stdout.on('data', function(data) {

        success(data);
    });

    pyprog.stderr.on('data', (data) => {

        nosuccess(data);
    });
});
*/

app.post('/productivityScore', (req, res) => {
    const userid = req.body.userid;
    const today = new Date().toISOString();
    const today_date = today.slice(0,10);
    var well = 10;
    /*Today Task Total*/
    db('today_task')
    .count('isdone')
    .where({
        userid: userid,
        entrydate: today_date
    })
    .then(input1 => {
        const in1 = parseInt(input1[0].count)
        db('today_task')
        .count('isdone')
        .where({
            userid: userid,
            entrydate: today_date,
            isdone: 1
        })
        .then(input2 => {
            const in2 = parseInt(input2[0].count)
            db('daily_task')
            .count('dailytaskid')
            .where({
                userid: userid
            })
            .then(input3 => {
                in3 = parseInt(input3[0].count)
                db('daily_task_status')
                .count('isdone')
                .where({
                    userid: userid,
                    taskdate: today_date,
                    isdone: 1
                })
                .then(input4 => {
                    let productivity;
                    let draw;
                    in4 = parseInt(input4[0].count)
                    const pyprog = spawn('python', ['./multi-node-tree.py', in1, in2, in3, in4, 1]);

                    pyprog.stdout.on('data', function(data) {
                        console.log("Data1", data.toString('utf8'));
                        productivity = parseFloat(data.toString('utf8')).toFixed(2)
                        draw = productivity;
                        console.log("This is the output", productivity);
                        db('productivity_score')
                        .insert({
                            userid: userid,
                            score: parseFloat(productivity).toFixed(2),
                            entry_date: today_date
                        })
                        .returning('score')
                        .then(prodScore => res.json(prodScore))
                        .catch(updateScore => {
                            db('productivity_score')
                            .update({
                                score: parseFloat(productivity).toFixed(2)
                            })
                            .where({
                                userid: userid,
                                entry_date: today_date
                            })
                            .returning('*')
                            .then(updatedScore => res.json(updatedScore[0]))
                        })
                        });

                    pyprog.stderr.on('data', (data) => {
                        console.log("Error is:", data.toString('utf8'))
                    });

                    /*res.json({
                        productivity_score: JSON.stringify(productivity_score)
                    })*/
                })
            })
        })
    })

    /*runPy
    .then(function(fromRunpy) {
        console.log(fromRunpy.toString('utf8'));
        productivity_score = JSON.parse(fromRunpy.toString('utf8'))
        res.json(productivity_score_args);
    })
    .catch(err => console.log("Error is:", err.toString('utf8')))*/
})

/* Productivity Overview*/
app.post('/overviewProductivityScore', (req, res) => {
    const userid = req.body.userid;
    const viewDate1 = new Date(req.body.viewDate);
    overviewDate = viewDate1.addDays(1);
    const str_overviewDate = overviewDate.toISOString()
    const overviewEntryDate = str_overviewDate.slice(0,10)

    db('productivity_score')
    .where({
        userid: userid,
        entry_date: overviewEntryDate
    })
    .returning('*')
    .then(prodScore => res.json(prodScore[0]))
    .catch(err => res.json(err))
})

/*Past 7 days productivity - Dashboard*/ 
app.post('/dashboardProductivityScore', (req, res) => {
    const userid = req.body.userid;
    const today = new Date().toISOString();
    const today_date = today.slice(0,10);
    var past_week = new Date();
    past_week.setDate(past_week.getDate()-7);

    db('productivity_score')
    .where('entry_date', '>=', past_week)
    .where('entry_date', '<=', today)
    .returning('*')
    .then(prodScore => res.json(prodScore))
    .catch(err => res.json(err))
})

app.listen(3005, () => {
    console.log('The server is running on post 3005');
})