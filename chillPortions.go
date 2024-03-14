package main

import (
	"math"
)

const (
	slp    = 1.6
	tetmlt = 277
	a1     = 2.567e18
	e1     = 12_888.8
	aa     = 5.43e-14
	ee     = 8735.3
)

func celciusToKelvin(celsius float64) float64 {
	return celsius + 273
}

func ftmprt(T float64) float64 {
	return slp * tetmlt * (celciusToKelvin(T) - tetmlt) / celciusToKelvin(T)
}

func sr(ftmprtVal float64) float64 {
	return math.Exp(ftmprtVal)
}

func xi(srVal float64) float64 {
	return srVal / (1 + srVal)
}

func xs(T float64) float64 {
	return aa * math.Exp(ee/celciusToKelvin(T))
}

func ak1(T float64) float64 {
	return a1 * math.Exp(-e1/celciusToKelvin(T))
}

func interS(interEValPrev, xiValPrev float64) float64 {
	if interEValPrev < 1 {
		return interEValPrev
	}
	return interEValPrev - interEValPrev*xiValPrev
}

func interE(xsVal, interSVal, ak1Val float64) float64 {
	return xsVal - (xsVal-interSVal)*math.Exp(-ak1Val)
}

func delt(interEVal, xiVal float64) float64 {
	if interEVal < 1 {
		return 0
	}
	return interEVal * xiVal
}

func chillingPortions(deltVal, cpPrevVal float64) float64 {
	return deltVal + cpPrevVal
}

func CalcChillPortions(tempSlice []float64, total bool) any {
	var (
		ftmprtArr []float64
		srArr     []float64
		xiArr     []float64
		xsArr     []float64
		ak1Arr    []float64
		interEArr []float64
		interSArr []float64
		deltArr   []float64
		cpArr     []float64
	)

	for i := 0; i < len(tempSlice); i++ {
		ftmprtArr = append(ftmprtArr, ftmprt(tempSlice[i]))
		srArr = append(srArr, sr(ftmprtArr[i]))
		xiArr = append(xiArr, xi(srArr[i]))
		xsArr = append(xsArr, xs(tempSlice[i]))
		ak1Arr = append(ak1Arr, ak1(tempSlice[i]))

		var interSVal float64
		if i == 0 {
			interSVal = interS(0, 0)
		} else {
			interSVal = interS(interEArr[i-1], xiArr[i-1])
		}
		interSArr = append(interSArr, interSVal)

		interEArr = append(interEArr, interE(xsArr[i], interSArr[i], ak1Arr[i]))

		deltArr = append(deltArr, delt(interEArr[i], xiArr[i]))

		var cpVal float64
		if i == 0 {
			cpVal = chillingPortions(deltArr[i], 0)
		} else {
			cpVal = chillingPortions(deltArr[i], cpArr[i-1])
		}
		cpArr = append(cpArr, cpVal)
	}

	if total {
		return cpArr[len(cpArr)-1]
	}
	return cpArr
}
