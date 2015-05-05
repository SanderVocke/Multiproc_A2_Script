# TEST FOR UTIL.PY

import util

testDeleteRubbish = False
testMoveResults = False
testDoTraceView = True

if testDeleteRubbish:
	util.deleteRubbish("./sim")
	
if testMoveResults:
	util.moveResults("./sim", "./outputs/data/test")
	
if testDoTraceView:
	util.doTraceView("./outputs", "data/test")