const express = require('express');
const cors = require('cors');
const knex = require('knex');
const session = require('express-session');
const { request, response } = require('express');
const bcrypt = require('bcrypt-nodejs')


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


const today_task = 
    {
        taskProfile: [     
            {
                id: 1,
                type: "Task",
                title: "Workout",
                desc: "Push, Core & 3x Circuit"
            },
            {
                id: 2,
                type: "Task",
                title: "Cardio",
                desc: "Run, 1.5 km"
            },
            {
                id: 3,
                type: "Event",
                title: "Subhecha's Birthday",
                desc: "20 July, 2021, she turns 22!"
            }
    ]
}

const daily_task = 
    {
        taskProfile: [     
            {
                id: 1,
                type: "Task",
                title: "Eat Healthy",
                desc: "Focus on intermittent fasting"
            },
            {
                id: 2,
                type: "Task",
                title: "LeetCode",
                desc: "2x LeetCode Questions"
            },
            {
                id: 3,
                type: "Task",
                title: "Guitar",
                desc: "Spend an hour practicing the guitar."
            }
    ]
}

const notes = 
    {
        taskProfile: [     
            {
                id: 1,
                title: "Research",
                desc: "I could work with genetic algorithms for my paper."
            },
            {
                id: 2,
                title: "Explore GRE?",
                desc: "Maybe I should explore writing GRE for further studies."
            },
            {
                id: 3,
                title: "Productivity",
                desc: "I need to be way more productive."
            }
    ]
}

const Data = {
  "time" : 1550476186479,
  "blocks" : [
    {
      "type": "header",
      "data": {
         "text": "I visited my grandmother!",
         "level": 2
      }
   },
   {
      "type": "paragraph",
      "data": {
         "text": "I visited my grandmother today, not only was it extremely fun, I also learned a lot. I got to ride horses and explore grandma's farm. It was super interesting!"
      }
   },
   {
      "type": "header",
      "data": {
         "text": "The animals she had were:",
         "level": 3
      }
   },
   {
      "type": "list",
      "data": {
         "style": "unordered",
         "items": [
            "Dogs",
            "Cows, Bulls",
            "And Pigs!"
         ]
      }
   },
   {
      "type": "header",
      "data": {
         "text": "I also completed my first ever marathon.",
         "level": 3
      }
   },
   {
      "type": "paragraph",
      "data": {
         "text": "I am so glad I could complete this marathon in time. Not only am I looking forward to participating in more, I also want to improve my half marathon timings in the next few months. Let's see how it goes!"
      }
   }
  ],
  "version" : "2.8.1"
}

const overviewData = {
    "time" : 1550476186479,
    "blocks" : [
      {
        "type": "header",
        "data": {
           "text": "Editor",
           "level": 2
        }
     },
     {
        "type": "paragraph",
        "data": {
           "text": "Hey. Meet the new Editor. On this page you can see it in action — try to edit this text. Source code of the page contains the example of connection and configuration."
        }
     },
     {
        "type": "header",
        "data": {
           "text": "Key features",
           "level": 3
        }
     },
     {
        "type": "list",
        "data": {
           "style": "unordered",
           "items": [
              "It is a block-styled editor",
              "It returns clean data output in JSON",
              "Designed to be extendable and pluggable with a simple API"
           ]
        }
     },
     {
        "type": "header",
        "data": {
           "text": "What does it mean «block-styled editor»",
           "level": 3
        }
     },
     {
        "type": "paragraph",
        "data": {
           "text": "Workspace in classic editors is made of a single contenteditable element, used to create different HTML markups. Editor.js <mark class=\"cdx-marker\">workspace consists of separate Blocks: paragraphs, headings, images, lists, quotes, etc</mark>. Each of them is an independent contenteditable element (or more complex structure) provided by Plugin and united by Editor's Core."
        }
     }
    ],
    "version" : "2.8.1"
  }
  


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
    .catch(err => res.json(NaN))
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


app.post('/todayTaskTotal', (req, res) => {
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
        entrydate: today_date,
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
    })
})






app.listen(3005, () => {
    console.log('The server is running on post 3005');
})