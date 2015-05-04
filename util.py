from os import listdir, remove
from os.path import isfile, join

def deleteRubbish(path):
	ignore = [line.strip() for line in open(path+'/file_ignorelist.txt')]	
	onlyfiles = [ f for f in listdir(path) if isfile(join(path,f)) ]
	for x in onlyfiles:
		if not x in ignore:
			remove(path+'/'+x)