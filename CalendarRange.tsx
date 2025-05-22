import React, { useEffect, useState } from "react";
import styles from "./Calendar.module.css";

const Calendar: React.FC = () => {
  const today = new Date();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());

  const firstDay = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  const daysOfWeek = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

  const [startDate, setStartDate] = useState<{ day: number; month: number; year: number } | null>(null);
  const [endDate, setEndDate] = useState<{ day: number; month: number; year: number } | null>(null);

  const [formattedStartDate, setFormattedStartDate] = useState<string | null>(null);
  const [formattedEndDate, setFormattedEndDate] = useState<string | null>(null);

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((prev) => prev - 1);
    } else {
      setCurrentMonth((prev) => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((prev) => prev + 1);
    } else {
      setCurrentMonth((prev) => prev + 1);
    }
  };

  const handleDateClick = (day: number) => {
    const selectedDate = { day, month: currentMonth, year: currentYear };

    if (startDate === null) {
      setStartDate(selectedDate);
      setEndDate(null);
    } else if (startDate !== null && endDate === null) {
      const start = new Date(startDate.year, startDate.month, startDate.day);
      const selected = new Date(selectedDate.year, selectedDate.month, selectedDate.day);

      if (selected < start) {
        setStartDate(selectedDate);
      } else {
        setEndDate(selectedDate);
      }
    } else {
      // NOTE: Reset seleção
      setStartDate(selectedDate);
      setEndDate(null);
    }
  };

  const isSameDate = (date: { day: number; month: number; year: number } | null, day: number) => {
    return date?.day === day && date?.month === currentMonth && date?.year === currentYear;
  };

  const isInRange = (day: number) => {
    if (startDate && endDate) {
      const current = new Date(currentYear, currentMonth, day);
      const start = new Date(startDate.year, startDate.month, startDate.day);
      const end = new Date(endDate.year, endDate.month, endDate.day);
      return current > start && current < end;
    }
    return false;
  };

  const isSelected = (day: number) => {
    return isSameDate(startDate, day) || isSameDate(endDate, day);
  };

  const formatDate = (date: { day: number; month: number; year: number }) => {
    const dayFormatted = date.day.toString().padStart(2, "0");
    const monthFormatted = (date.month + 1).toString().padStart(2, "0");
    const yearFormatted = date.year.toString().padStart(4, "0"); // <- Isso garante que o ano nunca fica com 3 dígitos
    return `${dayFormatted}/${monthFormatted}/${yearFormatted}`;
  };

  useEffect(() => {
    if (startDate !== null) {
      setFormattedStartDate(formatDate(startDate));
    } else {
      setFormattedStartDate(null);
    }

    if (endDate !== null) {
      setFormattedEndDate(formatDate(endDate));
    } else {
      setFormattedEndDate(null);
    }
  }, [startDate, endDate]);

  const days = [];

  for (let i = 0; i < firstDay; i++) {
    days.push(<div key={`empty-${i}`} className={styles.empty}></div>);
  }

  for (let d = 1; d <= daysInMonth; d++) {
    const dayClass = [styles.day, isSelected(d) ? styles.selected : "", isInRange(d) ? styles.inRange : ""].join(" ");

    days.push(
      <div key={d} className={dayClass} onClick={() => handleDateClick(d)}>
        {d}
      </div>,
    );
  }
  const parseDate = (dateString: string) => {
    const cleaned = dateString.trim().replace(/-/g, "/");
    const parts = cleaned.split("/");

    if (parts.length !== 3) return null;

    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1; // meses começam do 0
    const year = parseInt(parts[2], 10);

    if (isNaN(day) || isNaN(month) || isNaN(year)) return null;

    const date = new Date(year, month, day);
    if (date.getDate() === day && date.getMonth() === month && date.getFullYear() === year) {
      return { day, month, year };
    }
    return null;
  };

  const formatDateInput = (value: string) => {
    // Remove tudo que não for número
    let cleaned = value.replace(/\D/g, "");

    // Limita a 8 dígitos (ddmmyyyy)
    if (cleaned.length > 8) cleaned = cleaned.slice(0, 8);

    // Formata a string no padrão dd/mm/yyyy
    if (cleaned.length <= 2) {
      return cleaned;
    } else if (cleaned.length <= 4) {
      return `${cleaned.slice(0, 2)}/${cleaned.slice(2)}`;
    } else {
      return `${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}/${cleaned.slice(4)}`;
    }
  };

  const handleInputChange = (value: string, type: "start" | "end") => {
    // Aplica a máscara
    const maskedValue = formatDateInput(value);

    // Atualiza o estado do input (formatado)
    if (type === "start") {
      setFormattedStartDate(maskedValue);
    } else {
      setFormattedEndDate(maskedValue);
    }

    // Tenta parsear a data só se a máscara tiver tamanho 10 (dd/mm/yyyy completo)
    if (maskedValue.length === 10) {
      const parsedDate = parseDate(maskedValue);

      if (parsedDate) {
        if (type === "start") {
          if (endDate) {
            const start = new Date(parsedDate.year, parsedDate.month, parsedDate.day);
            const end = new Date(endDate.year, endDate.month, endDate.day);
            if (start > end) {
              // Ajusta para as duas datas ficarem iguais
              setEndDate(parsedDate);
              setFormattedEndDate(maskedValue);
            }
          }
          setStartDate(parsedDate);
          setCurrentMonth(parsedDate.month);
          setCurrentYear(parsedDate.year);
        } else {
          if (startDate) {
            const start = new Date(startDate.year, startDate.month, startDate.day);
            const end = new Date(parsedDate.year, parsedDate.month, parsedDate.day);
            if (end < start) {
              // Ajusta para as duas datas ficarem iguais
              setStartDate(parsedDate);
              setFormattedStartDate(maskedValue);
            }
          }
          setEndDate(parsedDate);
          setCurrentMonth(parsedDate.month);
          setCurrentYear(parsedDate.year);
        }
      }
    } else {
      // Se o valor estiver incompleto, não define datas no estado
      if (type === "start") {
        setStartDate(null);
      } else {
        setEndDate(null);
      }
    }
  };

  return (
    <div className={styles.calendar}>
      <input
        type="text"
        placeholder="DD/MM/AAAA"
        value={formattedStartDate || ""}
        onChange={(e) => handleInputChange(e.target.value, "start")}
      />

      <input
        type="text"
        placeholder="DD/MM/AAAA"
        value={formattedEndDate || ""}
        onChange={(e) => handleInputChange(e.target.value, "end")}
      />

      <div className={styles.header}>
        <button onClick={handlePrevMonth} className={styles.navButton}>
          ←
        </button>
        <h2>
          {new Date(currentYear, currentMonth)
            .toLocaleString("default", {
              month: "long",
            })
            .toUpperCase()}{" "}
          {currentYear}
        </h2>
        <button onClick={handleNextMonth} className={styles.navButton}>
          →
        </button>
      </div>

      <div className={styles.weekdays}>
        {daysOfWeek.map((day) => (
          <div key={day} className={styles.weekday}>
            {day}
          </div>
        ))}
      </div>

      <div className={styles.days}>{days}</div>

      <div className={styles.result}>
        <p>
          Data Inicial: <strong>{formattedStartDate || "--"}</strong>
        </p>
        <p>
          Data Final: <strong>{formattedEndDate || "--"}</strong>
        </p>
      </div>
    </div>
  );
};

export default Calendar;
