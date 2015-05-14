import combinations

#comb = combinations.allCombinations(8, [0,0,0,0,0,0,0,0], [2,2,3,4,3,2,1,1])
comb = combinations.allCombinations(3, [0,0,0], [2,2,4])

print("Number of combinations: " + str(len(comb)))
if len(comb) < 100: 
	print(str(comb))