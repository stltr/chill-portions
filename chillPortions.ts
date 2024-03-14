const slp = 1.6;
const tetmlt = 277;
// const a0 = 139_500
const a1 = 2.567e18;
// const e0 = 4153.5
const e1 = 12_888.8;

const aa = 5.43e-14; // a0 / a1
const ee = 8735.3; // e1 - e0

function celciusToKelvin(celcius: number) {
	return celcius + 273;
}

function ftmprt(T: number) {
	return (slp * tetmlt * (celciusToKelvin(T) - tetmlt)) / celciusToKelvin(T);
}

function sr(ftmprtVal: number) {
	return Math.exp(ftmprtVal);
}

function xi(srVal: number) {
	return srVal / (1 + srVal);
}

function xs(T: number) {
	return aa * Math.exp(ee / celciusToKelvin(T));
}

function ak1(T: number) {
	return a1 * Math.exp(-e1 / celciusToKelvin(T));
}

function interS(interEValPrev: number, xiValPrev: number) {
	if (interEValPrev < 1) {
		return interEValPrev;
	}
	return interEValPrev - interEValPrev * xiValPrev;
}

function interE(xsVal: number, interSVal: number, ak1Val: number) {
	return xsVal - (xsVal - interSVal) * Math.exp(-ak1Val);
}

function delt(interEVal: number, xiVal: number) {
	return interEVal < 1 ? 0 : interEVal * xiVal;
}

function chillingPortions(deltVal: number, cpPrevVal: number) {
	return deltVal + cpPrevVal;
}

// tempList: hourly temperature values in celcius
function calcChillPortions(tempList: number[], total: boolean): number[] | number {
	let ftmprtArr: number[] = [];
	let srArr: number[] = [];
	let xiArr: number[] = [];
	let xsArr: number[] = [];
	let ak1Arr: number[] = [];
	let interEArr: number[] = [];
	let interSArr: number[] = [];
	let deltArr: number[] = [];
	let cpArr: number[] = [];

	for (let i = 0; i < tempList.length; i++) {
		ftmprtArr.push(ftmprt(tempList[i]));
		srArr.push(sr(ftmprtArr[i]));
		xiArr.push(xi(srArr[i]));
		xsArr.push(xs(tempList[i]));
		ak1Arr.push(ak1(tempList[i]));

		if (i === 0) {
			// bypass init to keep same list length
			interSArr.push(interS(0, 0));
		} else {
			interSArr.push(interS(interEArr[i - 1], xiArr[i - 1]));
		}
		interEArr.push(interE(xsArr[i], interSArr[i], ak1Arr[i]));

		deltArr.push(delt(interEArr[i], xiArr[i]));

		if (i === 0) {
			cpArr.push(chillingPortions(deltArr[i], 0));
		} else {
			cpArr.push(chillingPortions(deltArr[i], cpArr[i - 1]));
		}
	}

	if (total) {
		return cpArr[cpArr.length - 1];
	} else {
		return cpArr;
	}
}

export default calcChillPortions;
