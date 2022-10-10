import { useMemo, useState } from 'react';

export const daysShortArr = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab', 'Dom'];

export const daysArr = [
  'Domimgo',
  'Segunda-feira',
  'Terça-feira',
  'Quarta-feira',
  'Quinta-feira',
  'Sexta-feira',
  'Sabado',
];

const monthNamesArr = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
];

export interface ICalendarDay {
  classes: string;
  dateFormat: string;
  date: Date;
  value: number;
}

const useCalendar = (daysShort = daysShortArr, monthNames = monthNamesArr) => {
  const today = new Date();
  const todayFormatted = `${today.getDate()}-${
    today.getMonth() + 1
  }-${today.getFullYear()}`;

  const [selectedDate, setSelectedDate] = useState(today);
  const [selected, setSelected] = useState(todayFormatted);

  const calendarRowsMap = useMemo(() => {
    const daysInWeek = [1, 2, 3, 4, 5, 6, 0];

    const selectedMonthLastDate = new Date(
      selectedDate.getFullYear(),
      selectedDate.getMonth() + 1,
      0,
    );
    const prevMonthLastDate = new Date(
      selectedDate.getFullYear(),
      selectedDate.getMonth(),
      0,
    );
    const daysInMonth = selectedMonthLastDate.getDate();
    const firstDayInMonth = new Date(
      selectedDate.getFullYear(),
      selectedDate.getMonth(),
      1,
    ).getDay();
    const startingPoint = daysInWeek.indexOf(firstDayInMonth) + 1;
    let prevMonthStartingPoint =
      prevMonthLastDate.getDate() - daysInWeek.indexOf(firstDayInMonth) + 1;
    let currentMonthCounter = 1;
    let nextMonthCounter = 1;
    const rows = 6;
    const cols = 7;
    const calendarRows = {} as Record<number, ICalendarDay[]>;

    for (let i = 1; i < rows + 1; i++) {
      for (let j = 1; j < cols + 1; j++) {
        if (!calendarRows[i]) {
          calendarRows[i] = [];
        }

        if (i === 1) {
          if (j < startingPoint) {
            calendarRows[i] = [
              ...calendarRows[i],
              {
                classes: 'in-prev-month',
                date: new Date(
                  `${
                    selectedDate.getMonth() === 0
                      ? selectedDate.getFullYear() - 1
                      : selectedDate.getFullYear()
                  }-${
                    selectedDate.getMonth() === 0 ? 12 : selectedDate.getMonth()
                  }-${prevMonthStartingPoint}`,
                ),
                dateFormat: `${prevMonthStartingPoint}-${
                  selectedDate.getMonth() === 0 ? 12 : selectedDate.getMonth()
                }-${
                  selectedDate.getMonth() === 0
                    ? selectedDate.getFullYear() - 1
                    : selectedDate.getFullYear()
                }`,
                value: prevMonthStartingPoint,
              },
            ];
            prevMonthStartingPoint++;
          } else {
            calendarRows[i] = [
              ...calendarRows[i],
              {
                classes: '',
                dateFormat: `${currentMonthCounter}-${
                  selectedDate.getMonth() + 1
                }-${selectedDate.getFullYear()}`,
                date: new Date(
                  `${selectedDate.getFullYear()}-${
                    selectedDate.getMonth() + 1
                  }-${currentMonthCounter}`,
                ),
                value: currentMonthCounter,
              },
            ];
            currentMonthCounter++;
          }
        } else if (i > 1 && currentMonthCounter < daysInMonth + 1) {
          calendarRows[i] = [
            ...calendarRows[i],
            {
              classes: '',
              dateFormat: `${currentMonthCounter}-${
                selectedDate.getMonth() + 1
              }-${selectedDate.getFullYear()}`,
              date: new Date(
                `${selectedDate.getFullYear()}-${
                  selectedDate.getMonth() + 1
                }-${currentMonthCounter}`,
              ),
              value: currentMonthCounter,
            },
          ];
          currentMonthCounter++;
        } else {
          calendarRows[i] = [
            ...calendarRows[i],
            {
              classes: 'in-next-month',
              date: new Date(
                `${
                  selectedDate.getMonth() + 2 === 13
                    ? selectedDate.getFullYear() + 1
                    : selectedDate.getFullYear()
                }-${
                  selectedDate.getMonth() + 2 === 13
                    ? 1
                    : selectedDate.getMonth() + 2
                }-${nextMonthCounter}`,
              ),
              dateFormat: `${nextMonthCounter}-${
                selectedDate.getMonth() + 2 === 13
                  ? 1
                  : selectedDate.getMonth() + 2
              }-${
                selectedDate.getMonth() + 2 === 13
                  ? selectedDate.getFullYear() + 1
                  : selectedDate.getFullYear()
              }`,
              value: nextMonthCounter,
            },
          ];
          nextMonthCounter++;
        }
      }
    }

    return calendarRows;
  }, [selectedDate]);

  const calendarRows = useMemo(() => {
    return Object.values(calendarRowsMap);
  }, [calendarRowsMap]);

  const getPrevMonth = ({ week }: { week: (day: number) => void }) => {
    setSelectedDate(
      (prevValue) =>
        new Date(prevValue.getFullYear(), prevValue.getMonth() - 1, 1),
    );
    if (week)
      week(
        new Date(
          selectedDate.getFullYear(),
          selectedDate.getMonth(),
          -1,
        ).getDate(),
      );
  };

  const getNextMonth = () => {
    setSelectedDate(
      (prevValue) =>
        new Date(prevValue.getFullYear(), prevValue.getMonth() + 1, 1),
    );
  };

  const getTodayMonth = () => {
    setSelectedDate(new Date());
    setSelected(todayFormatted);
  };

  const getPrevWeek = () => {
    Object.keys(calendarRowsMap).map((key) => {
      if (
        calendarRowsMap[Number(key)].findIndex(
          (i) => i.dateFormat == selected,
        ) != -1 &&
        calendarRowsMap[parseInt(key) - 1]
      ) {
        setSelected(calendarRowsMap[parseInt(key) - 1][0].dateFormat);
      } else if (
        calendarRowsMap[Number(key)].findIndex(
          (i) => i.dateFormat == selected,
        ) != -1 &&
        !calendarRowsMap[parseInt(key) - 1]
      ) {
        const month = parseInt(calendarRowsMap[3][0].dateFormat.split('-')[1]);
        const year = parseInt(calendarRowsMap[3][0].dateFormat.split('-')[2]);

        const getDay = () => {
          if (calendarRowsMap[1][0].classes != '')
            return calendarRowsMap[1][0].value - 1;
          return false;
        };

        const getMonth = () => {
          if (month - 1 == 0) return 12;
          return month - 1;
        };

        const getYear = () => {
          if (month - 1 == 0) return year - 1;
          return year;
        };

        const onGetLastDay = (day: number) => {
          const actual = getDay();
          setSelected(`${actual ? actual : day}-${getMonth()}-${getYear()}`);
        };

        getPrevMonth({ week: onGetLastDay });
      }
    });
  };

  const getNextWeek = () => {
    Object.keys(calendarRowsMap).map((key) => {
      if (
        calendarRowsMap[Number(key)].findIndex(
          (i) => i.dateFormat == selected,
        ) != -1 &&
        parseInt(key) == 5 &&
        calendarRowsMap[6] &&
        calendarRowsMap[6].findIndex((i) => i.classes == '') == -1
      ) {
        const month = parseInt(calendarRowsMap[3][0].dateFormat.split('-')[1]);
        const year = parseInt(calendarRowsMap[3][0].dateFormat.split('-')[2]);

        const getDay = () => {
          if (calendarRowsMap[5][6].classes != '')
            return calendarRowsMap[5][6].value + 1;
          return 1;
        };

        const getMonth = () => {
          if (month + 1 > 12) return 1;
          return month + 1;
        };

        const getYear = () => {
          if (month + 1 > 12) return year + 1;
          return year;
        };

        setSelected(`${getDay()}-${getMonth()}-${getYear()}`);
        getNextMonth();
      }

      if (
        calendarRowsMap[Number(key)].findIndex(
          (i) => i.dateFormat == selected,
        ) != -1 &&
        calendarRowsMap[parseInt(key) + 1]
      ) {
        setSelected(calendarRowsMap[parseInt(key) + 1][0].dateFormat);
      } else if (
        calendarRowsMap[Number(key)].findIndex(
          (i) => i.dateFormat == selected,
        ) != -1 &&
        !calendarRowsMap[parseInt(key) + 1]
      ) {
        const month = parseInt(calendarRowsMap[3][0].dateFormat.split('-')[1]);
        const year = parseInt(calendarRowsMap[3][0].dateFormat.split('-')[2]);

        const getDay = () => {
          if (calendarRowsMap[6][6].classes != '')
            return calendarRowsMap[6][6].value + 1;
          return 1;
        };

        const getMonth = () => {
          if (month + 1 > 12) return 1;
          return month + 1;
        };

        const getYear = () => {
          if (month + 1 > 12) return year + 1;
          return year;
        };

        setSelected(`${getDay()}-${getMonth()}-${getYear()}`);
        getNextMonth();
      }
    });
  };

  const getToday = () => {
    setSelected(todayFormatted);
    getTodayMonth();
  };

  const onSetSelectedDate = (date: Date) => {
    setSelectedDate(date);
    setSelected(
      `${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}`,
    );
  };

  return {
    daysShort,
    daysArr,
    monthNames,
    todayFormatted,
    calendarRowsMap,
    selectedDate,
    getPrevMonth,
    getNextMonth,
    getTodayMonth,
    getPrevWeek,
    getNextWeek,
    selected,
    getToday,
    calendarRows,
    onSetSelectedDate,
  };
};

export default useCalendar;
