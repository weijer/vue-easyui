export class DateHelper {

	parseSelections(format) {
		let selections = [];
		let formatTokens = format.split(/[^A-Za-z]/);
		let start = 0;
		let end = 0;
		for(let token of formatTokens){
			if (token){
				end += token.length;
				selections.push([start, end]);
				start = end + 1;
				end = start;
			} else {
				start++;
				end++;
			}
		}
		return selections;
	}

	parseDate(value, format) {
		if (!value){
			return null;
		}
		let formatTokens = format.split(/[^A-Za-z]/).filter(t => t);
		let dateTokens = value.split(/[^A-Za-z0-9]/).filter(t => t);
		let date = new Date();
		date.setHours(0);
		date.setMinutes(0);
		date.setSeconds(0);
		date.setMilliseconds(0);

		let parser = {
			dd:   (value) => date.setDate(value),
			d:    (value) => date.setDate(value),
			MM:   (value) => date.setMonth(+value - 1),
			M:    (value) => date.setMonth(+value - 1),
			yyyy: (value) => date.setFullYear(value),
			yy:   (value) => {
				value = +value;
				let year = new Date().getFullYear();
				if (value + 2000 - year < 20){
					value += 2000;
				} else {
					value += 1900;
				}
				date.setFullYear(value);
			},
			HH:   (value) => date.setHours(value),
			H:    (value) => date.setHours(value),
			mm:   (value) => date.setMinutes(value),
			ss:   (value) => date.setSeconds(value),
			SSS:  (value) => date.setMilliseconds(value),
			SS:   (value) => date.setMilliseconds(value),
			S:    (value) => date.setMilliseconds(value)
		};

		for(let i=0; i<formatTokens.length; i++){
			let formatToken = formatTokens[i];
			let dateToken = dateTokens[i];
			let f = parser[formatToken];
			if (f){
				f(+dateToken || 0);
			}
		}

		return date;
	}

	formatDate(date, format) {
		if (!date) {
			return '';
		}
		let formatN = (value) => {
			return value < 10 ? '0' + value : value;
		};
		let formatter = {
			dd:   () => formatN(date.getDate()),
			d:    () => date.getDate(),
			MM:   () => formatN(date.getMonth() + 1),
			M:    () => date.getMonth() + 1,
			yyyy: () => date.getFullYear(),
			yy:   () => String(date.getFullYear()).substr(2, 2),
			HH:   () => formatN(date.getHours()),
			mm:   () => formatN(date.getMinutes()),
			ss:   () => formatN(date.getSeconds()),
			SSS:  () => formatN(date.getMilliseconds()),
			SS:   () => formatN(date.getMilliseconds()),
			S:    () => date.getMilliseconds()
		};
		return format.replace(/dd|d|M{1,4}|yyyy|yy|HH|mm|ss|S{1,3}|E{3,4}/g, (match) => {
			let f = formatter[match];
			return f ? f() : match;
		});
	}
}
export default new DateHelper();
