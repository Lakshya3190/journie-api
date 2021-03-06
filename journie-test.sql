CREATE TABLE user_account (
    Id BIGSERIAL NOT NULL PRIMARY KEY,
    firstName VARCHAR(50),
    lastName VARCHAR(50),
    email VARCHAR(50),
    password VARCHAR(100),
    dateOfJoin DATE
);

INSERT INTO user_account (firstName, lastName, email, dateOfJoin) VALUES ('Lakshya', 'Tyagi', 'lakshya.tyagi@gmail.com', 'mypassword', 2020-01-01);

CREATE TABLE user_data (
    SNo SERIAL NOT NULL PRIMARY KEY,
    userid BIGINT NOT NULL REFERENCES user_account(Id),
    todaytask VARCHAR(50) NOT NULL UNIQUE REFERENCES today_task_join(todaytask),
    notes VARCHAR(50) NOT NULL UNIQUE REFERENCES notes_join(notes),
    journal BIGINT NOT NULL UNIQUE REFERENCES journal(journalid),
    dailytask SERIAL NOT NULL UNIQUE REFERENCES daily_task(dailyTaskId)
);



CREATE TABLE today_task_join (
    todayTask VARCHAR(50) NOT NULL,
    todayTaskId INT NOT NULL REFERENCES today_task(todayTaskId)
);

CREATE TABLE today_task(
    todayTaskId BIGSERIAL PRIMARY KEY,
    taskType VARCHAR(10) NOT NULL,
    taskTitle VARCHAR(100) NOT NULL,
    taskDesc VARCHAR(500) NOT NULL,
    isDone INT DEFAULT 0 NOT NULL,
    entryDate DATE NOT NULL
);


CREATE TABLE schedule_task(
    sTaskId BIGSERIAL PRIMARY KEY,
    taskType VARCHAR(10) NOT NULL,
    taskTitle VARCHAR(100) NOT NULL,
    taskDesc VARCHAR(500) NOT NULL,
    entryDate DATE NOT NULL
);

CREATE TABLE notes_join(
    notes VARCHAR(50) NOT NULL,
    notesId BIGSERIAL NOT NULL REFERENCES notes(notesId)
);

CREATE TABLE notes(
    notesId BIGSERIAL PRIMARY KEY,
    notesTitle VARCHAR(100) NOT NULL,
    notesDesc VARCHAR(500) NOT NULL,
    entryDate DATE NOT NULL
);

CREATE TABLE journal(
    journalId BIGSERIAL PRIMARY KEY,
    journalData JSON NOT NULL,
    entryDate DATE NOT NULL,
    journalScore INT
);

CREATE TABLE daily_task(
    dailyTaskId SERIAL PRIMARY KEY,
    taskType VARCHAR(10) NOT NULL,
    taskTitle VARCHAR(100) NOT NULL,
    taskDesc VARCHAR(500) NOT NULL
);

CREATE TABLE daily_task_status(
    SNo SERIAL PRIMARY KEY,
    dailyTaskId SERIAL REFERENCES daily_task(dailyTaskId),
    taskDate DATE NOT NULL,
    isDone INT DEFAULT 0
);

