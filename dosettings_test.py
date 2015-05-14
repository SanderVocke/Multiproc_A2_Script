import dosettings
import constraints

doTestCountSettings = False
doTestDoSims = True

if doTestCountSettings:
	print(str(dosettings.countSettings([constraints.useTwoCoresMax,
					constraints.MIPSOnly, constraints.task1tocore1,
					constraints.task2tocore2, constraints.task3tocore1])))
					
if doTestDoSims:
	dosettings.doSims([constraints.useTwoCoresMax,
					constraints.MIPSOnly, constraints.task1tocore1,
					constraints.task2tocore2, constraints.task3tocore1], './outputs/data/dosim_test', "S1")
