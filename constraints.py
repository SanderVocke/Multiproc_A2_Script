def useThreeCoresMax(setting):
	for i in range(4,12):
		if setting[i]==3:
			return False
	return True

def useThreeCoresMaxTrue(setting):
	coresUsed = []
	n = 0
	for i in range(4,12):
		if not setting[i] in coresUsed:
			coresUsed.append(setting[i])
			n = n + 1
	if n > 3:
		return False
	return True
	
def useTwoCoresMax(setting):
	for i in range(4,12):
		if setting[i]==3 or setting[i]==2:
			return False
	return True
	
def useTwoCoresMaxSemiTrue(setting):
	coresUsed = []
	n = 0
	for i in range(4,12):
		if setting[i]==3:
			return False
		if not setting[i] in coresUsed:
			coresUsed.append(setting[i])
			n = n + 1
	if n > 2: 
		return False
	return True
	
def MIPSOnly(setting):
	for i in range(0,4):
		if setting[i]!=0:
			return False
	return True
	
def task1tocore1(setting):
	if setting[4]!=0:
		return False
	return True
	
def task2tocore2(setting):
	if setting[5]!=1:
		return False
	return True
	
def task3tocore1(setting):
	if setting[6]!=0:
		return False
	return True

efficient = [0,1,0,1,1,1,1,1]
fast = [0,2,0,0,2,2,0,0]

def mapForTaskEfficiency(setting):
	cores = setting[0:4] #get cores
	tasks = setting[4:12] #get tasks
	for i in range(0,8): #for each task
		if not (cores[tasks[i]] == efficient[i]):
			return False
	return True
	
def mapForTaskEfficiencySlack1(setting):
	cores = setting[0:4] #get cores
	tasks = setting[4:12] #get tasks
	slack = 0
	for i in range(0,8): #for each task
		if not (cores[tasks[i]] == efficient[i]):
			slack = slack+1
			if slack >= 2:
				return False
	return True
	
def mapForTaskEfficiencySlack2(setting):
	cores = setting[0:4] #get cores
	tasks = setting[4:12] #get tasks
	slack = 0
	for i in range(0,8): #for each task
		if not (cores[tasks[i]] == efficient[i]):
			slack = slack+1
			if slack >= 3:
				return False
	return True
	
def mapForTaskEfficiencySlack3(setting):
	cores = setting[0:4] #get cores
	tasks = setting[4:12] #get tasks
	slack = 0
	for i in range(0,8): #for each task
		if not (cores[tasks[i]] == efficient[i]):
			slack = slack+1
			if slack >= 4:
				return False
	return True
	
def mapForTaskSpeed(setting):
	cores = setting[0:4] #get cores
	tasks = setting[4:12] #get tasks
	for i in range(0,8): #for each task
		if not (cores[tasks[i]] == fast[i]):
			return False
	return True
	
def reduceOrder(setting):
	cores = setting[0:4]
	MIPSused = False
	ARMused = False
	TRIused = False
	for x in cores:
		if x == 0:
			MIPSused = True
		elif x == 1:
			ARMused = True
		elif x == 2:
			TRIused = True
	if MIPSused and (cores[0]!=0):
		return False #MIPS was used but not on core 0
	if ARMused and (cores[1]!=1):
		return False #ARM was used but not on core 1
	if TRIused and (cores[2]!=2):
		return False #TRI was used but not on core 2
	return True
		