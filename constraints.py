def useThreeCoresMax(setting):
	for i in range(4,12):
		if setting[i]==3:
			return False
	return True
	
def useTwoCoresMax(setting):
	for i in range(4,12):
		if setting[i]==3 or setting[i]==2:
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