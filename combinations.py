def allCombinations(numvariables, low, high):
	if numvariables == 1:
		list = []
		for i in range(low[0], high[0]+1):
			list.append((i,))
		return list
	else:
		listin = allCombinations(numvariables - 1, low[1:], high[1:])
		list = []
		for x in listin:
			for i in range(low[0], high[0]+1):
				list.append((i,) + x)
		return list			
		
def permute(xs, low=0):
    if low + 1 >= len(xs):
        yield xs
    else:
        for p in permute(xs, low + 1):
            yield p        
        for i in range(low + 1, len(xs)):        
            xs[low], xs[i] = xs[i], xs[low]
            for p in permute(xs, low + 1):
                yield p        
            xs[low], xs[i] = xs[i], xs[low]