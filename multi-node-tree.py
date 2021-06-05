import os
import sys
#os.system('python -m pip install {}'.format(sys.argv[4]))
import numpy as np
import skfuzzy as fuzz
from skfuzzy import control as ctrl

if int(sys.argv[1])>0:
    percent1 = (int(sys.argv[2])//int(sys.argv[1]))*100
else:
    percent1 = 0

if int(sys.argv[3])>0:
    percent2 = (int(sys.argv[4])//int(sys.argv[3]))*100
else:
    percent2 = 0

# FLU 1

TodayTaskTotal = ctrl.Antecedent(np.arange(0, 10 , 1), 'TodayTaskTotal')
TodayTaskDone = ctrl.Antecedent(np.arange(0, 100 , 1), 'TodayTaskDone')
task_productivity = ctrl.Consequent(np.arange(0, 10, 1), 'task_productivity')

TodayTaskDone.automf(3)


TodayTaskTotal['poor'] = fuzz.trimf(TodayTaskTotal.universe, [0, 0, 2])
TodayTaskTotal['average'] = fuzz.trimf(TodayTaskTotal.universe, [0, 4, 8])
TodayTaskTotal['good'] = fuzz.trimf(TodayTaskTotal.universe, [4, 10,10])

task_productivity['low'] = fuzz.trimf(task_productivity.universe, [0, 0, 5])
task_productivity['medium'] = fuzz.trimf(task_productivity.universe, [0, 5, 10])
task_productivity['high'] = fuzz.trimf(task_productivity.universe, [5, 10, 10])

rule1 = ctrl.Rule(TodayTaskTotal['poor'] & TodayTaskDone['poor'], task_productivity['low'])
rule2 = ctrl.Rule(TodayTaskTotal['poor'] & TodayTaskDone['average'], task_productivity['medium'])
rule3 = ctrl.Rule(TodayTaskTotal['poor'] & TodayTaskDone['good'], task_productivity['high'])
rule4= ctrl.Rule(TodayTaskTotal['average'] & TodayTaskDone['poor'], task_productivity['low'])
rule5= ctrl.Rule(TodayTaskTotal['average'] & TodayTaskDone['average'], task_productivity['medium'])
rule6= ctrl.Rule(TodayTaskTotal['average'] & TodayTaskDone['good'], task_productivity['high'])
rule7= ctrl.Rule(TodayTaskTotal['good'] & TodayTaskDone['poor'], task_productivity['medium'])
rule8= ctrl.Rule(TodayTaskTotal['good'] & TodayTaskDone['average'], task_productivity['high'])
rule9= ctrl.Rule(TodayTaskTotal['good'] & TodayTaskDone['good'], task_productivity['high'])


# FLU 2

DailyTaskTotal = ctrl.Antecedent(np.arange(0, 6 , 1), 'DailyTaskTotal')
DailyTaskDone = ctrl.Antecedent(np.arange(0, 100 , 1), 'DailyTaskDone')
daily_task_productivity = ctrl.Consequent(np.arange(0, 10, 1), 'daily_task_productivity')

DailyTaskDone.automf(3)

DailyTaskTotal['poor'] = fuzz.trimf(DailyTaskTotal.universe, [0, 0, 2])
DailyTaskTotal['average'] = fuzz.trimf(DailyTaskTotal.universe, [0, 4, 8])
DailyTaskTotal['good'] = fuzz.trimf(DailyTaskTotal.universe, [4, 10,10])

daily_task_productivity['low'] = fuzz.trimf(daily_task_productivity.universe, [0, 0, 5])
daily_task_productivity['medium'] = fuzz.trimf(daily_task_productivity.universe, [0, 5, 10])
daily_task_productivity['high'] = fuzz.trimf(daily_task_productivity.universe, [5, 10, 10])

daily_rule1 = ctrl.Rule(DailyTaskTotal['poor'] & DailyTaskDone['poor'], daily_task_productivity['low'])
daily_rule2 = ctrl.Rule(DailyTaskTotal['poor'] & DailyTaskDone['average'], daily_task_productivity['medium'])
daily_rule3 = ctrl.Rule(DailyTaskTotal['poor'] & DailyTaskDone['good'], daily_task_productivity['high'])
daily_rule4= ctrl.Rule(DailyTaskTotal['average'] & DailyTaskDone['poor'], daily_task_productivity['low'])
daily_rule5= ctrl.Rule(DailyTaskTotal['average'] & DailyTaskDone['average'], daily_task_productivity['medium'])
daily_rule6= ctrl.Rule(DailyTaskTotal['average'] & DailyTaskDone['good'], daily_task_productivity['high'])
daily_rule7= ctrl.Rule(DailyTaskTotal['good'] & DailyTaskDone['poor'], daily_task_productivity['low'])
daily_rule8= ctrl.Rule(DailyTaskTotal['good'] & DailyTaskDone['average'], daily_task_productivity['high'])
daily_rule9= ctrl.Rule(DailyTaskTotal['good'] & DailyTaskDone['good'], daily_task_productivity['high'])

# FLU 3

TodayTask = ctrl.Antecedent(np.arange(0, 10, 1), 'TodayTask')
DailyTask = ctrl.Antecedent(np.arange(0, 10, 1), 'DailyTask')
total_task_productivity_score = ctrl.Consequent(np.arange(0, 10, 1), 'total_task_productivity_score')

TodayTask.automf(3)
DailyTask.automf(3)

total_task_productivity_score['low'] = fuzz.trimf(total_task_productivity_score.universe, [0, 0, 5])
total_task_productivity_score['medium'] = fuzz.trimf(total_task_productivity_score.universe, [0, 5, 10])
total_task_productivity_score['high'] = fuzz.trimf(total_task_productivity_score.universe, [5, 10, 10])

all_task_rule1 = ctrl.Rule(TodayTask['poor'] & DailyTask['poor'], total_task_productivity_score['low'])
all_task_rule2 = ctrl.Rule(TodayTask['poor'] & DailyTask['average'], total_task_productivity_score['medium'])
all_task_rule3 = ctrl.Rule(TodayTask['poor'] & DailyTask['good'], total_task_productivity_score['medium'])
all_task_rule4= ctrl.Rule(TodayTask['average'] & DailyTask['poor'], total_task_productivity_score['low'])
all_task_rule5= ctrl.Rule(TodayTask['average'] & DailyTask['average'], total_task_productivity_score['medium'])
all_task_rule6= ctrl.Rule(TodayTask['average'] & DailyTask['good'], total_task_productivity_score['high'])
all_task_rule7= ctrl.Rule(TodayTask['good'] & DailyTask['poor'], total_task_productivity_score['medium'])
all_task_rule8= ctrl.Rule(TodayTask['good'] & DailyTask['average'], total_task_productivity_score['high'])
all_task_rule9= ctrl.Rule(TodayTask['good'] & DailyTask['good'], total_task_productivity_score['high'])

# FLU 4

F_TaskScore = ctrl.Antecedent(np.arange(0, 10, 1), 'F_TaskScore')
SentimentAnalysis = ctrl.Antecedent(np.arange(0, 2, 1), 'SentimentAnalysis')
final_productivity_score = ctrl.Consequent(np.arange(0, 10, 1), 'final_productivity_score')

F_TaskScore['low'] = fuzz.trimf(F_TaskScore.universe, [0, 0, 5])
F_TaskScore['medium'] = fuzz.trimf(F_TaskScore.universe, [0, 5, 10])
F_TaskScore['high'] = fuzz.trimf(F_TaskScore.universe, [5, 10, 10])

SentimentAnalysis['negative'] = fuzz.trimf(SentimentAnalysis.universe, [0, 0, 1])
SentimentAnalysis['positive'] = fuzz.trimf(SentimentAnalysis.universe, [0, 1, 2])


final_productivity_score['low'] = fuzz.trimf(final_productivity_score.universe, [0, 0, 5])
final_productivity_score['medium'] = fuzz.trimf(final_productivity_score.universe, [0, 5, 10])
final_productivity_score['high'] = fuzz.trimf(final_productivity_score.universe, [5, 10, 10])

final_rule1 = ctrl.Rule(F_TaskScore['low'] & SentimentAnalysis['negative'], final_productivity_score['low'])
final_rule2 = ctrl.Rule(F_TaskScore['low'] & SentimentAnalysis['positive'], final_productivity_score['low'])
final_rule3= ctrl.Rule(F_TaskScore['medium'] & SentimentAnalysis['negative'], final_productivity_score['medium'])
final_rule4= ctrl.Rule(F_TaskScore['medium'] & SentimentAnalysis['positive'], final_productivity_score['high'])
final_rule5= ctrl.Rule(F_TaskScore['high'] & SentimentAnalysis['negative'], final_productivity_score['medium'])
final_rule6= ctrl.Rule(F_TaskScore['high'] & SentimentAnalysis['positive'], final_productivity_score['high'])

# Execution Flow
# FLU 1 Execution
TodayTask_ctrl = ctrl.ControlSystem([rule1, rule2, rule3, rule4, rule5, rule6, rule7, rule8, rule9])
TodayTask_score = ctrl.ControlSystemSimulation(TodayTask_ctrl)
TodayTask_score.input['TodayTaskTotal'] = int(sys.argv[1])
TodayTask_score.input['TodayTaskDone'] = int(sys.argv[2])
TodayTask_score.compute()
FLU1_Output = (TodayTask_score.output['task_productivity'])

# FLU 2 Execution
DailyTask_ctrl = ctrl.ControlSystem([daily_rule1, daily_rule2, daily_rule3, daily_rule4, daily_rule5, daily_rule6, daily_rule7, daily_rule8, daily_rule9])
DailyTask_score = ctrl.ControlSystemSimulation(DailyTask_ctrl)

DailyTask_score.input['DailyTaskTotal'] = int(sys.argv[3])
DailyTask_score.input['DailyTaskDone'] = int(sys.argv[4])

DailyTask_score.compute()
FLU2_Output = DailyTask_score.output['daily_task_productivity']

# FLU 3 Execution
TotalTask_ctrl = ctrl.ControlSystem([all_task_rule1, all_task_rule2, all_task_rule3, all_task_rule4, all_task_rule5, all_task_rule6, all_task_rule7, all_task_rule8, all_task_rule9])
TotalTask_score = ctrl.ControlSystemSimulation(TotalTask_ctrl)

TotalTask_score.input['TodayTask'] = FLU1_Output
TotalTask_score.input['DailyTask'] = FLU2_Output


TotalTask_score.compute()
FLU3_Output = TotalTask_score.output['total_task_productivity_score']

# FLU 4 Execution
TotalScore_ctrl = ctrl.ControlSystem([final_rule1, final_rule2, final_rule3, final_rule4, final_rule5, final_rule6])
TotalScore_score = ctrl.ControlSystemSimulation(TotalScore_ctrl)

TotalScore_score.input['F_TaskScore'] = FLU3_Output
TotalScore_score.input['SentimentAnalysis'] = int(sys.argv[5])

TotalScore_score.compute()
FLU4_Output = TotalScore_score.output['final_productivity_score']
print(FLU4_Output)
sys.stdout.flush()