function formatDate(date: Date): string {
  const year = ('000' + date.getFullYear()).substr(-4);
  const month = ('0' + (date.getMonth() + 1)).substr(-2);
  const day = ('0' + date.getDate()).substr(-2);
  return `${year}_${month}_${day}`;
}

interface onDateType {
  (year: number, month: number, date: number): void;
}
interface onHeaderDayType {
  (day: number): void;
}
interface onDelimterType {
  (): void;
}

export default class monthCalendarGenerator {
  private year: number;
  private month: number;
  private shift: number;

  private onDateFunc: onDateType = (year: number, month: number, date: number) => {};
  private onHeaderDayFunc: onHeaderDayType = (day: number) => {};
  private onBeginFunc: onDelimterType = () => {};
  private onEndFunc: onDelimterType = () => {};
  private onHeaderBeginFunc: onDelimterType = () => {};
  private onHeaderEndFunc: onDelimterType = () => {};
  private onRowBeginFunc: onDelimterType = () => {};
  private onRowEndFunc: onDelimterType = () => {};

  constructor(year: number, month: number, shift = 1) {
    this.year = year;
    this.month = month;
    this.shift = shift;
  }

  onDate(func: onDateType) {
    this.onDateFunc = func;
    return this;
  }

  onHeaderDay(func: onHeaderDayType) {
    this.onHeaderDayFunc = func;
    return this;
  }

  onBegin(func: onDelimterType) {
    this.onBeginFunc = func;
    return this;
  }

  onEnd(func: onDelimterType) {
    this.onEndFunc = func;
    return this;
  }

  onHeaderBegin(func: onDelimterType) {
    this.onHeaderBeginFunc = func;
    return this;
  }

  onHeaderEnd(func: onDelimterType) {
    this.onHeaderEndFunc = func;
    return this;
  }

  onRowBegin(func: onDelimterType) {
    this.onRowBeginFunc = func;
    return this;
  }

  onRowEnd(func: onDelimterType) {
    this.onRowEndFunc = func;
    return this;
  }
  // shift: 日曜日始まりなら0, 月曜日始まりなら1

  generate() {
    const year = this.year;
    const month = this.month;
    const shift = this.shift;
    //表示対象前月
    const prev_month_last_date = new Date(year, month - 1, 0);
    const prev_month_days = prev_month_last_date.getDate();
    const prev_month = prev_month_last_date.getMonth() + 1;
    const prev_year = prev_month_last_date.getFullYear();

    //表示対象月の1日
    const first_date = new Date(year, month - 1, 1);
    const first_day = new Date(year, month - 1, 1).getDay();
    const start_shift = Math.abs(shift - first_day);

    // 表示対象月の最後の日
    const last_date = new Date(year, month, 0);
    const month_days = last_date.getDate();
    const cal_row_size = Math.ceil((start_shift + month_days) / 7);

    //表示対象翌月
    const next_month_first_date = new Date(year, month, 1);
    const next_month = next_month_first_date.getMonth() + 1;
    const next_year = next_month_first_date.getFullYear();

    this.onBeginFunc();
    let current_row_size = cal_row_size;
    let current_week_size = 7;
    let day_count = 0;
    this.onHeaderBeginFunc();
    for (let i = 0; i < 7; i++) this.onHeaderDayFunc((i + shift) % 7);

    this.onHeaderEndFunc();
    while (current_row_size--) {
      this.onRowBeginFunc();
      current_week_size = 7;
      while (current_week_size--) {
        day_count++;
        if (day_count < start_shift + 1) {
          // 前月
          this.onDateFunc(
            prev_year,
            prev_month,
            prev_month_last_date.getDate() - (start_shift - day_count)
          );
        } else if (day_count < start_shift + month_days + 1) {
          // 今月
          this.onDateFunc(year, month, day_count - start_shift);
        } else {
          // 翌月
          this.onDateFunc(next_year, next_month, day_count - (start_shift + month_days));
        }
      }
      this.onRowEndFunc();
    }
    this.onEndFunc();
  }
}

export function createCalendarUnitArray(
  year: number,
  month: number,
  shift = 1
): Array<Array<calenderDayUnit>> {
  let result: Array<Array<calenderDayUnit>> = new Array();
  let currentRow: Array<calenderDayUnit> = new Array();
  const generator = new monthCalendarGenerator(year, month, shift)
    .onRowBegin(() => {
      currentRow = new Array();
    })
    .onDate((year: number, month: number, date: number) => {
      currentRow.push(new calenderDayUnit(year, month, date));
    })
    .onRowEnd(() => {
      result.push(currentRow);
    })
    .generate();

  return result;
}

export function createCalendarHeader(
  shift = 1,
  dayNames = new Array<string>()
): Array<number | string> {
  let header: Array<number | string> = new Array();
  for (let i = 0; i < 7; i++) header.push((i + shift) % 7);
  if (dayNames.length > 6) header = header.map(value => dayNames[value as number]);
  return header;
}

class calenderDayUnit {
  private pYear: number;
  private pMonth: number;
  private pnumDate: number;

  constructor(year: number, month: number, numdate: number) {
    this.pYear = year;
    this.pMonth = month;
    this.pnumDate = numdate;
  }

  get year() {
    return this.pYear;
  }
  get month() {
    return this.pMonth;
  }
  get numDate() {
    return this.pnumDate;
  }
  get day() {
    return new Date(this.pYear, this.pMonth - 1, this.pnumDate).getDay();
  }
  getDate() {
    return new Date(this.pYear, this.pMonth - 1, this.pnumDate);
  }
}

function createCalendarDateArray(year: number, month: number, shift = 1): Array<Array<Date>> {
  let result: Array<Array<Date>> = new Array();
  let currentRow: Array<Date> = new Array();
  const generator = new monthCalendarGenerator(year, month, shift)
    .onBegin(() => {})
    .onHeaderBegin(() => {})
    .onHeaderDay((day: number) => {})
    .onRowBegin(() => {
      currentRow = new Array();
    })
    .onDate((year: number, month: number, date: number) => {
      currentRow.push(new Date(year, month - 1, date));
    })
    .onRowEnd(() => {
      result.push(currentRow);
    })
    .generate();
  return result;
}
