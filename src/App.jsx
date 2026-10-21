import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  Home, BarChart3, Sparkles, PiggyBank, Plus, Receipt, Check, CircleDot, Clock, KeyRound, Truck,
  LifeBuoy, X, Trophy, ShoppingBag, Wallet, CalendarDays, ChevronRight, ChevronLeft, Zap, RefreshCw,
  ArrowDownLeft, ArrowUpRight, Heart, Settings, Trash2, Plane, Car, Camera, Sofa, Target, RotateCcw, Pencil
} from "lucide-react";

/* ═══════════════════════════ Справочники ═══════════════════════════
   Здесь только подсказки для настройки. Всё, что видит пара в приложении,
   берётся из того, что они сами заполнили. */



const GOAL_PRESETS = [
  { id: "move", emoji: "📦", title: "Переезд", stages: ["Залог", "Первый месяц аренды", "Грузчики и коробки", "Подушка на старт"] },
  { id: "trip", emoji: "✈️", title: "Отпуск", stages: ["Билеты", "Жильё", "Деньги на месте"] },
  { id: "wedding", emoji: "💍", title: "Свадьба", stages: ["Площадка и банкет", "Кольца", "Наряды", "Фотограф"] },
  { id: "car", emoji: "🚗", title: "Машина", stages: ["Первый взнос", "Страховка", "Оформление"] },
  { id: "safety", emoji: "🛟", title: "Подушка безопасности", stages: ["Первый месяц расходов", "Второй месяц", "Третий месяц"] },
  { id: "custom", emoji: "✨", title: "", stages: [""] },
];

// Типичные «утечки». Пара выбирает только свои и сама ставит суммы.
const HABIT_LIBRARY = [
  { id: "delivery", emoji: "🍱", label: "Доставка еды", amount: 1500, win: "Не заказали доставку", challenge: "Неделя без доставки еды" },
  { id: "coffee", emoji: "☕", label: "Кофе навынос", amount: 350, win: "Кофе дома", challenge: "Неделя кофе только дома" },
  { id: "taxi", emoji: "🚕", label: "Такси", amount: 500, win: "Обошлись без такси", challenge: "Неделя без такси" },
  { id: "market", emoji: "📦", label: "Маркетплейсы", amount: 2000, win: "Очистили корзину", challenge: "Неделя без заказов на маркетплейсах" },
  { id: "lunch", emoji: "🥡", label: "Обеды в кафе", amount: 600, win: "Обед из дома", challenge: "Неделя обедов из дома" },
  { id: "snacks", emoji: "🍫", label: "Перекусы и сладкое", amount: 250, win: "Без перекусов", challenge: "Неделя без перекусов" },
  { id: "smoke", emoji: "🚭", label: "Сигареты / вейп", amount: 300, win: "День без сигарет", challenge: "Неделя без сигарет" },
  { id: "bar", emoji: "🍷", label: "Бары и алкоголь", amount: 1500, win: "Вечер без бара", challenge: "Неделя без алкоголя" },
  { id: "clothes", emoji: "👗", label: "Одежда и косметика", amount: 2500, win: "Не купили обновку", challenge: "Неделя без покупок одежды" },
  { id: "games", emoji: "🎮", label: "Игры и донаты", amount: 500, win: "Не задонатили", challenge: "Неделя без донатов" },
  { id: "subs", emoji: "📺", label: "Подписки", amount: 400, win: "Отменили подписку", challenge: "Неделя без новых подписок" },
];

const REWARDS = [
  "Кино в выходные", "Завтрак в любимом месте", "Вечер настолок", "Прогулка и мороженое",
  "Ужин, приготовленный вместе", "Пикник в парке", "Ленивое утро без будильника",
];

const PERSONAS = [
  { id: "zen", emoji: "🧘‍♂️", name: "Дзен-коуч", hint: "мягкая поддержка" },
  { id: "batya", emoji: "😤", name: "Токсичный батя", hint: "жёсткий сарказм" },
  { id: "buh", emoji: "🤓", name: "Душный бухгалтер", hint: "сухие цифры" },
];

const WEEK = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];


/* ═══════════════════════════ «Тёплая керамика»: токены ═══════════════════════════
   background #FFF8EE · surface #FFFCF7 · text/primary #294734 · text-muted #5E675C
   sage #A8B99A · peach #EDAC85 · honey #D9AA55 · border #E6DDCF · error #A83D36
   Старые имена палитр (slate/emerald/indigo/amber/rose) переназначены на эти токены,
   поэтому разметка компонентов осталась прежней.                                      */
const TW_CONFIG = /*TW_CONFIG_START*/{
  theme: {
    extend: {
      colors: {
        cream: "#FFF8EE",
        surface: "#FFFCF7",
        ink: { DEFAULT: "#294734", hover: "#1F3828" },
        muted: "#5E675C",
        line: "#E6DDCF",
        sand: "#F4ECDF",
        sage: { DEFAULT: "#A8B99A", soft: "#EEF1E8", deep: "#6F8A62" },
        peach: { DEFAULT: "#EDAC85", soft: "#FBE9DD" },
        honey: { DEFAULT: "#D9AA55", soft: "#FBF0DA", deep: "#8A6420" },
        danger: { DEFAULT: "#A83D36", soft: "#F8E4E0" },
        white: "#FFFCF7",
        slate: { 50: "#FFF8EE", 100: "#F4ECDF", 200: "#E6DDCF", 300: "#B3AA9B", 400: "#5E675C", 500: "#5E675C", 600: "#4C5A4D", 700: "#3B4F40", 800: "#294734", 900: "#294734" },
        emerald: { 50: "#EEF1E8", 100: "#DFE7D6", 200: "#C9D5BD", 300: "#A8B99A", 400: "#6F8A62", 500: "#294734", 600: "#1F3828", 700: "#294734", 800: "#1F3828", 900: "#173020" },
        indigo: { 50: "#FBF0DA", 100: "#F4E2BF", 200: "#EACF98", 300: "#D9AA55", 400: "#C3913C", 500: "#8A6420", 600: "#294734", 700: "#294734", 800: "#1F3828", 900: "#294734", 950: "#294734" },
        amber: { 50: "#FBF0DA", 100: "#F4E2BF", 200: "#EACF98", 300: "#D9AA55", 400: "#EDAC85", 500: "#294734", 600: "#8A6420", 700: "#6E4F17", 800: "#294734", 900: "#294734" },
        rose: { 50: "#F8E4E0", 100: "#F0CCC5", 200: "#E3B0A6", 300: "#D58C7F", 400: "#EDAC85", 500: "#A83D36", 600: "#A83D36" },
      },
      boxShadow: {
        soft: "0 6px 24px rgba(59,47,29,.06)",
        sheet: "0 -10px 40px rgba(59,47,29,.12)",
      },
      fontFamily: {
        sans: ["Onest", "ui-sans-serif", "system-ui", "-apple-system", "Segoe UI", "Roboto", "sans-serif"],
      },
    },
  },
}/*TW_CONFIG_END*/;
if (typeof window !== "undefined" && window.tailwind) window.tailwind.config = TW_CONFIG;

/* ═══════════════════════════ Персонажи ═══════════════════════════
   Квадратные изображения с прозрачностью, уменьшенные до 128 px (лицо крупнее, без ладошек).
   Персонаж выбирается независимо от пола; цвет не зависит от роли или размера взноса.      */
const IMG = {
  peach: "data:image/webp;base64,UklGRuAUAABXRUJQVlA4WAoAAAAQAAAAfwAAfwAAQUxQSA8JAAABDAVt20gOf9j3H4KImAC3qweVslcOb9ROy0WbRNvo8BcraHuwA1q0rR2SpPujObZt27Zt27Zt27Zt27Y9VWNWI/7//764DxEZGZmR/R4REyAxkiRFkvTX+CGiH7qoa1eAiJgANNsZYPJNLnq1b2DUiD8+vHWPmQBnMOY0Dljpxl9YzHOS/OeOJQA7xrDA8i+STDGJqorEROaXTAA3hnAY9/KcMSatKjHxk9ngxgge837EGFWlkqpk7JsHdgzgsPzfzETrDPxpSmN7nsMSAwzalhQ044Nwvc6a6foZRCuKqoq2zLgNXG8zzj7/54c1iI6qpvy7sYzpaQ5784cpWTVwJ/heZs2kf8jvAKJuyF+G6WUepzAYY/cUJB85HWzvMhinP08STAduDt+7HNZh1Gen9QbjvPfOe+9sG1flQW8YERGNvBWuccY5VLXetjBwHzGVOVx4FLZpDsA4i21/4lU3X3PuAWtPCcDZEoupBygl+emoRj7XNGNh1rnpB7b+54l9pwWcAeCwCEU7FfggXKMcsMVbJCW0JPnvFfMArrAmYzt9yXgJfJMcpriTjCFpa4mBHHXeRHDw2LgaJFDbv1EOi3zPELVdCcpv1oDz2KCamaWkS8E1x2K+v5lp5bygKoE8EoOwUltE1cSvhsA0xtjxv2DQmlPkeTDzJO104KVwaKzDJRytRalBU8YrMNk/lPoQURUu0iCL2bMk9clono9PmNo4pxH5rLForMfZzLR+kMBtTmNooy4qKS4A1xzjPsxjB1RF/r1dpYQR1cAL4NBYiyn+pXRGlRStCp2UfzOeNU2aM2rHRasDlCTly8ChSQtRShgg6awE7gWHRs0RtC5ggQSeBI8mG4z3C6UmN6TA0+BNo2DwSh7runkTlIfDGTTb4yiGwicGjtoBzqDhFtONVGmEBH6zODya73A9Qws2xZwPTQaPHmjNjCNT6r7AEfsADj3RYW9mZXsl8rMFYS16pMMNHL2EKCmvnhAePdO4IY/yByviwLgH4NBDDYbewhQ7QCOwbzk4g55qgOOFMdWF9cT+uTDYGmN6CYzFEs+SKUotzZR/PzPKrfPemR4BOGDD10lKCEmkExI2nXTGaaaZYsJhBuXOW9MLYA3Mytf1s5inGEqT9DT+NWJgxMC/v337wdM3nrDtYhOj6J1pHuAAjLfsYTe/+0dga4WWss0/371+7/kdAG+bB+McihPPvuxaW+6085ab73zm+xNSnmIIWRCSlI/OXNIDxpmmATDOO7Scea/7fshwXkRVNcUsU5IfnbwAAGcaVzSDDDD7Ue+SpI4DWEwhkempTR3gmmc84Ne5ewSpISaZArAuMUvkO7uPBWMb5oCx93yfZEjalYiUqKrEQH65M+BMgxww3j5fkSGIdmsVVY0Z+fTigGuKcbA7f0uGJNouNWptp8D84ongTCMcsOxrZJa0qkR1OlJBRFU1Jn63IWC7zziMf6EwJNHOgDdkNUpGXj4WfLdZg1U/Y4rabgmlFF9KDHxjZvjucvDnkpnoFL3nGX9bC76bPKZ9hjGKNvicmkbqDvDd47Hkzxwt0nWU+jHxIPhu8dhkFIN2gDlap6KSeBh8VxiPvahJC1LTOAOeikrkgfDd4HEkY1RVLYCyBPCxRO4O3zmPgxiStBCUJYDPJeWrwXfKYz8GkQpuRMWdSQYWhuuMx1aMoiW4ENx4TqaRn41nTCccls5SUin5zoEPwHfAYpr+PIqq6PcO3Ae+NuP8i8xEtJwOPILGOVMSRy0EW5fHucykNh5By7nAdwY5U4/DWoxSLGsnDC3M8xaS8VC4WqydqE+TFqQCgAQ58I6Jqin9P62xEw5XMdMSreZuNmjGa+EGHFZkFH3OEwBXaJJF4doydshHeT3nIuGNEwxFPlSDx57MpNqJdtdQmZKYL2lcG8aM/5PGAhemJ2PHUhHJeAva8TiGmZQPdYEePIJMRURHzgJbyZiJftFU5f2InXMeqGrgafCVPA5jpiKiCc8sQrI78euhxlQwZtg3edJSQAlgTknYQkcT14ar4LHln1+mO2AbvZ/5tZUsng1AFdMnqhC4/QS/+cNwmBYWs2aqREUcRxVA8SORxKXhWngcx5+m3AFzgPd1wzoh49HwLYx9j79rJnRITARU8AMJfAy2zGKepKMBFUwxxTYPzukk9o8LU+KxN0NExyqQcXFVARWowQtJ+aJwJRb3Mo7MgjcOtyy1kcDt4QsGY/1IUVzZYoCaygiqBp5S5rCwiqpsAOsMuDO5Ha7gsQOzQkiHGuAYwdog8kWYsrMqCc+ofHbi+wZFh/sZ2iMAR5nj3vT1YBgAMO8xSgIbXm77cayCwfDvmfRrJsCGvrHLJvuL0nWMUMH7VM4LixlG5bUBKKyAYLEk/jhW2axRO4I3PT5OE78d0iLVxW3cahPAtg9thZrBEN7dEwxwJ5HPwqKF1JNfK3EhYB55E1zJTDFvARUKKwHcnvF4+JKp/mctXxGeBG5aYjDWDy3AKpBwwSeYwIToqBlhUTRvMxVoWAgbIpExpcgPHEod7mYoxKCCX5HbMpWQXwtX4nECMyFhhCGgcGYYSKXA7eFbrM9QxbsB8AKcxylVlXzENLAlFtOP0qSgWETgjZEzBOqQqEY+BotyY99hVJFGjmVKfqyIBm4P38LjbGbWMYarCUOACm8AkpT/NgFMC4cVGRv5iBUVCqK+UpCSjGfBo6XBkG8Y63EAZ1EDZQpvLhFJ8u/UxraCx6nMpJ5xGFmKiKhkPBcOFS1mHS2t2AfG0CEjLEiSP6c0tgoc7mEoiH4iMKUQWFFEJeNecGhjSaZCMwHGioBwqWjgc9aZanC4m6EeFlDxMcZJRs4BizatmW10kjYINlbkUR64JRzadjiJoY0qL0CfQSfjmfBo37gh7zCWSAtInl5qxoaMD1hvaoDFAiFJoW3gRTeiht3RfHioNajVYW+GEmmPDQQqgErSlYx3DYVBzR5XMCuUkuAmuUWJW1F4sYFF3cYNepJZiahCpODNI1EBDGckY9gX1qB+Y8Z5lqFEBGMwxBU+FfL9xeAMOmkx1hNMZWZ+S5G+48eCQ4ctht6ZR1WtMkmNiAWRjwEONQIAVlA4IKoLAABwOQCdASqAAIAAPkkei0OioaEWyhbMKASEswBlOvP/iuj1BV4D8oPbWtr+D/EHR1Ul543L/5m6lXmAfqr+ufXB8wH7S/uB7rX+X/WD3Pf3X+9+wB/XP+P1hnoAfsN6sP/R/dn4Jv2y/cH4Bf1v//PWAcDN+Dv6gfJaRdVWrWuuX8aH6X/xPCm1mFZXyT1KP6f6r3+F49Pp/2Bf5f/V+tb+0XsUfsOp3FP4HBhyBDOqQhj8ARygrJG0Tssj9fGMOcbk18Ec2zdzh+Hhk6gYMrsrb9qEy3lGMU66TihCV++eNMgIRX3DbTeX3t6PrnWxpoOM3OUZm0XYn4zlUn+yG+cZWvG14SXMy/PwdH3juf/UxftNWO0DFvaTWNv/8lMDMlWJVv803xEgg+3gb2lvlrn43ZY6V1lUBrEUlo9Y5WqhB5MNL1kfEJXZgMLXQBYM4JYbWRdVTsQ0/pUbil0HMqGlE1MCxpIIQ9rPSQC8lM3Hevg421qF5m3igB2swzXGYQp/AeEMDtFOrN0lWqVrpxjft77X0FSfPG5giaygzeUDurE1/l9h19JBarao3uf4ee3STwi4T2cYSKc62Xm+Z/SuCKnfUdtV6NCThpUGPJff20VMRQAA/v6lNpn+h0UD3vjknO8I9CGf3kN4vOBJP0jx16C+IAaMqHhvSnFr6wCBfR///2bq6vcbTGRen6r9c3J6pWSdvVJ5zL8FemUuwMrwzb9+zg0YILCh09aCYz6tpZWVCFBmeKKIGWE5SUA7Uz8FP2AZTVWlZCud9P+7KwhULBRqzXS+PpwW+xmdd/E6dIkJcOFVS9foxfOrGStY709iBw/ChpFjzglikvgyCNMnM6lZv2XQHivxFXdlqBV0M/9iRJLCiUW9by3MBtys+e3o+SlJnTTgA6eLGi5DVJMTttX4ODdSulzFfza8pugDQdVV//vtW7ni7HF8kHBGKUIG3U9CJywQdLZ7HZsuZqsFqrApTfnkCUuj86p5rhNbArq7cR5jabDCHl29jw//32D/8AQ/8ATiI1p5uJfO28TKA9zxSs0W/26qF2LxIi3CRXWtx8QZMVElVg6W9xThWi0uEdYWeqKu2Ir90282+pBzUdoNlBI7EfiI/Nhf8XZ1YUxA3skvlYMwmRf2A93LrvuDWQdin1UAGBuAbgQYFngJUUMGc5Q3+dSvy95UieVHB9N3oxNZBEB25+T9Al7LQKlY3OyebV1zrH/Rrn9txVawlPLDgC1LFX/6llpJDnpQSgvYsWDXMTq+KjLk9RAtj3yI7zew6kXtsWJvs8m5G0k+qE3qZj1QRhG1/8CuXqsurO7M8/mV4NcoA2qJyviTEjNgID3EWlIRpS2f++A7Au96Lu0/sAFgqp4wNV8HnVq8uU/PyJc9nH+pMwaVGnpT/xBbhh/7tt4jKEshjIAPn/RMNx6g6CZBoskHHob8Qqp+HVzvhk/ngVdwb2BvYM4B5W4umRM0TLpQh2sLmIbEOVNdI9FqyIZM3bee/9UQ9khRIXnenE1aMnAoIufpkjl0nfRcyTrTS9a+NqF8sLAqRMz/5Ug8NUC0HYNobkxqMn9meBwT48RZG6AjmK6TmgotWdbchRZaVYMqsl9WdiMeujU1zK72QakE+lrCuNtAjZXqpxVZMctu8PGy94B46ejB4uYRmDGfU4GbXiMXJeeosikfMkqOOEAHWdc4zT/aJEe0FOELKkiTQqU3F9GYWW3kny8n/yj+VmBJynXr0JONHwHbtD7BYjRz5jknmUxnzuBzRMXSv9IFlV4LKgusr/OiB5OSuS6nuxOA7LWX3+1ilh5t01RKybMLInvIoHBvg6rBwuPSy4Le/IUiUe6+y9KLr67ajVhdZP4beYpF18zBZ8/PRb2R+kDWYef1u3mkmug7u1nbVqnBnAnKMWQh2AAAj/vCIyec+2C/ymMf6yYcWlGUDC7zjFv+Qf5qTgDZfuDZIY/SCy/mqVX1+ieEsSU0fwfRGsWkNth4yTRXSJO8P8vHyEHk5Y8gBalcyUcqdMWcXuE37Je6fk7qs5HTPSO0zmGDJrxbzl7RugOBbjxK6CsW0BUcTUcPn+3sXbkIZCj9rgUj/am+KcEKJp7ONr5+CnKMqaAO9S9Ea0+aGq25ZGCDUdat1+iY7W+dGE1SPrqIBnEATVnBmXwcGlyPyJAPoY5/sv5up3RF61SACcO+i1UOJJ7qmwMXKwB8+qMaUHkajoXawtBj+O8Hr02GiYwDNA6S2UaSippueah+8vXrS/y1TNu6/R585ALgNuo4Y+aBqU4ud8X5lWqVFpEn1k3zu9Qdx2u9EUhKcMiO+SphNKbB4H/hPHYJS6rGeuLVS2zNdCvfO7p5GWbYMKj34fGbp/N7pCoTnqe5FH32MNye2djR24Z+dZmwPnhBXlinBrEbn9961/KjbZfo/fWLUYS+UH3/+jbdaeOhHDZwoZPQ+VI10vTqh1rwXV4fEWsjJ0ZujPhvdKzdkqScCVNi1IqF8CzvWGjF0JDsX694V8c7L2plrgJaE7S23gN48DzIrbVora5+Bt4rqcVb5ZoubfFc2r4n0Q24K2gHeCSHb2pDSLCEk6h1xQ6UVhjiUaqRi/tzlBhWTUscyc4KmtoVKQ8Iy7rZx7IIG484qWp4uYrYVf294R/04RnvmBp6neZR/jNhdC1pdU2hXwGqu83qNPEdQ5vK2tcMv3cb/OPDEMNYdpYVjJICDgI2Ae3Kxfj3BaAWWqtznwL1dgTWrwOnfuPIglF5rX31yMWCof2KwM+Wp2J1U74lCf8vTdi3epuMJWe5NL4Sc5Yn8VZcE9xBaQWFRHpr9NOGqNCeWaPOLqWlVOGotdvpbzgx5vfhB3wRTFsDbJfbNvB/B/4Jdhrpbp1oWYNKgoPAd45kuyEaXw5Sq0o6sR5xFmCabrK5fOvNx0zOKg4ReU7gbHdwjtqbvhOXSHo0i2b7S590vRW190BtmoJXBoTjlI0LgdGUsPB4s7UMLmISbwBuYWujHy06P6qwFIuALklKCb2qHzBS/YKv+wQds8iZEahgdT9kn/wlkhuyYnOAv88qGhDs2L6HkVbsJN4x87XMXOfHQ4wl1HPqoWqj/pZPq35wiia000Yb1nc54j4f5jt0ksKGihiOJON/1o9oN13uu3MAF/rGrYAxKHFp4NWx8sNLu2UumKFxVBo6xmUz8/wVMwPnTOaDvP77HyfMo3CApkR6iU/Tx4YrC2A0OoRkC1/5vvpJ+L6Z74o0rkot7wFWkIKYg5n904tEUywIi6awh+gnIA98xL0RdUQY5RCarVZ2XvQYysFHN9zHunQGcTS/NZmV/NF47bs5NY8XCyGEdg7ila6hlVf3IMKxcwjfh31nxghTJvkpwBFEnrZEL9k5u/T0grEXjNE/oEqZrEl5/PJS/G5S7fqjDBxZHsur5pVCvdSzl6w8WD1KlRSnSfshEVFXCRw0wyln6augOF1HHcgmKkXM5/L8HTuUXIeiaRTvCbMB7qKOxm2sJsZY7VuQCCYVg1uIgc6gp0+V6kvjvN44x6KSYVEInUIr1QMsizZk2kX4t5wIRUvBqvt5wzDLadMifWxrdr8ui1USOv64rPaKHm7xZCrIjK3cN3yagvvqQT680j1o0vqf4JHLnJQeAplT4aq1paixNptP40U+MPX19gbZQdgLEYY+xCX59/c/g3wV2+oiz7YR1DFOoE7+lWq6Ct7bsZ57qkiZrrqIVXEt/ksg3GgyMN/sz4A3Wk2P+ZW/Vt2EPY+JvtracoSVccYcP6EF5Rys/w4CJICTnS1POd+wY7PLXeFmVr4FUNrV2KMJm3uE4u4SXLyqvYPotvuknwoRdBAJnaK1Y36/3Hu0+jxGmopCt07mCvKFIvk6RKbaHp+h6SfIGO3kRarmSJZE3XT555CyuCS4WU58Wjxr7HZx/KgPP/uj/RhabfcOpSvIl1hRcsZ/Bmwe8VfbFy13HDUnXu9VzjBoths8ohUxgAAA",
  sage: "data:image/webp;base64,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",
  ogonek: "data:image/webp;base64,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",
};
const AVATARS = {
  peach: { name: "Персик", src: IMG.peach, bg: "bg-peach-soft", bar: "bg-peach" },
  sage: { name: "Шалфей", src: IMG.sage, bg: "bg-sage-soft", bar: "bg-sage-deep" },
};
const avatarKey = (p) => (p && AVATARS[p.avatar] ? p.avatar : p && p.id === "p2" ? "sage" : "peach");
const avatarOf = (p) => AVATARS[avatarKey(p)];
// Цвет полоски партнёра на графиках: если оба выбрали одного персонажа, второго рисуем тёмно-зелёным
const barOf = (p, partners) => {
  const k = avatarKey(p);
  const twin = partners && partners.find((x) => x.id !== p.id && avatarKey(x) === k);
  return twin && p.id === partners[partners.length - 1].id ? "bg-ink" : AVATARS[k].bar;
};

/* ═══════════════════════════ Хелперы ═══════════════════════════ */

const fmt = (n) => `${Math.round(n).toLocaleString("ru-RU")} ₽`;
const plural = (n, f) => {
  const a = Math.abs(n) % 100, b = a % 10;
  if (a > 10 && a < 20) return f[2];
  if (b > 1 && b < 5) return f[1];
  if (b === 1) return f[0];
  return f[2];
};
const r1 = (x) => Math.round(x * 10) / 10;
const n1 = (x) => String(r1(x)).replace(".", ",");
const dayWord = (x) => (Number.isInteger(r1(x)) ? plural(r1(x), ["день", "дня", "дней"]) : "дня");
const daysText = (n) => `${n} ${plural(n, ["день", "дня", "дней"])}`;
const pctStr = (x) => (x * 100 < 1 ? "меньше 1%" : `${Math.round(x * 100)}%`);
const sum = (arr) => arr.reduce((s, e) => s + (Number(e.amount) || 0), 0);
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
const clone = (x) => JSON.parse(JSON.stringify(x));

const ymd = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const parseDate = (s) => { const [y, m, d] = s.split("-").map(Number); return new Date(y, m - 1, d); };
const startOfToday = () => { const t = new Date(); t.setHours(0, 0, 0, 0); return t; };
const daysUntil = (s) => (s ? Math.round((parseDate(s) - startOfToday()) / 86400000) : 0);
const dateLong = (s) => parseDate(s).toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" });
const dateShort = (s) => parseDate(s).toLocaleDateString("ru-RU", { day: "numeric", month: "long" });
const monthName = (s) => { const m = parseDate(s).toLocaleDateString("ru-RU", { month: "long" }); return m[0].toUpperCase() + m.slice(1); };
const addMonths = (n) => { const d = startOfToday(); d.setMonth(d.getMonth() + n); return ymd(d); };
const weekKey = () => { const d = startOfToday(); d.setDate(d.getDate() - ((d.getDay() + 6) % 7)); return ymd(d); };
const todayIdx = () => (new Date().getDay() + 6) % 7;

const whenLabel = (ts) => {
  const d = new Date(ts); d.setHours(0, 0, 0, 0);
  const diff = Math.round((startOfToday() - d) / 86400000);
  if (diff === 0) return "Сегодня";
  if (diff === 1) return "Вчера";
  return new Date(ts).toLocaleDateString("ru-RU", { day: "numeric", month: "short" });
};
const isToday = (ts) => whenLabel(ts) === "Сегодня";

const stageIcon = (title = "") => {
  const s = title.toLowerCase();
  if (/залог|ключ/.test(s)) return KeyRound;
  if (/аренд|кварт|жиль|дом|ипотек/.test(s)) return Home;
  if (/груз|перевоз|короб|переезд/.test(s)) return Truck;
  if (/подушк|резерв|запас|месяц/.test(s)) return LifeBuoy;
  if (/билет|перел|самол|виз/.test(s)) return Plane;
  if (/машин|авто|страхов|взнос|шин/.test(s)) return Car;
  if (/фото|видео/.test(s)) return Camera;
  if (/мебел|ремонт|диван|техник/.test(s)) return Sofa;
  if (/кольц|свадь|банкет|наряд/.test(s)) return Heart;
  return Target;
};

const goalTotal = (goal) => sum(goal.stages);


const haptic = (style = "light") => {
  try { window.Telegram?.WebApp?.HapticFeedback?.impactOccurred(style); } catch (e) { /* не в Telegram */ }
};

const newChallenge = (habits, prev) => {
  if (!habits.length) return null;
  const idx = prev ? (habits.findIndex((h) => h.id === prev.habitId) + 1) % habits.length : 0;
  return { habitId: habits[idx].id, reward: prev ? pick(REWARDS.filter((r) => r !== prev.reward)) : REWARDS[0], days: {}, week: weekKey() };
};
const countDays = (ch) => (ch ? Object.values(ch.days || {}).filter(Boolean).length : 0);

function useAnimatedNumber(value, duration = 700) {
  const [display, setDisplay] = useState(value);
  const current = useRef(value);
  useEffect(() => {
    const from = current.current, to = value;
    if (from === to) return;
    let raf;
    const start = performance.now();
    const tick = (t) => {
      const p = Math.min(1, (t - start) / duration);
      const v = from + (to - from) * (1 - Math.pow(1 - p, 3));
      current.current = v;
      setDisplay(v);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, duration]);
  return display;
}

function Money({ value, className = "" }) {
  const v = useAnimatedNumber(value);
  return <span className={`tabnum ${className}`}>{fmt(v)}</span>;
}

/* ═══════════════════════════ «ИИ»: генератор отговорок ═══════════════════════════
   Переводит цену в метрики именно вашей цели: этапы, аренда (если есть такой этап),
   ваши же привычки и сдвиг даты. */

function buildVerdict({ item, price: p, persona, config, total }) {
  const name = item.trim() || "эта штука";
  const { goal, habits } = config;
  const G = goal.title;
  const D = dateShort(goal.date);
  const target = goalTotal(goal);
  const daysLeft = Math.max(0, daysUntil(goal.date));
  const remaining = Math.max(0, target - total);
  const perDay = daysLeft > 0 ? remaining / daysLeft : remaining;

  const f = {};
  let before = 0;
  for (const s of goal.stages) {
    if (total < before + s.amount) {
      const left = before + s.amount - total;
      f.stage = p >= left ? `весь остаток этапа «${s.title}»` : `${pctStr(p / s.amount)} этапа «${s.title}»`;
      break;
    }
    before += s.amount;
  }
  const rentStage = goal.stages.find((s) => /аренд/i.test(s.title));
  if (rentStage) {
    const d = p / (rentStage.amount / 30);
    const h = Math.max(1, Math.round(d * 24));
    f.rent = d >= 1 ? `${n1(d)} ${dayWord(d)} жизни в новой квартире` : `${h} ${plural(h, ["час", "часа", "часов"])} жизни в новой квартире`;
  }
  const cheaper = habits.filter((h) => h.amount > 0 && h.amount < p).sort((a, b) => a.amount - b.amount)[0];
  if (cheaper) {
    const n = Math.floor(p / cheaper.amount);
    f.habit = `${n} × ${cheaper.emoji} «${cheaper.label}»`;
  }
  if (perDay > 0) {
    const d = p / perDay;
    const h = Math.max(1, Math.round(d * 24));
    f.delay = d >= 1 ? `${n1(d)} ${dayWord(d)}` : `${h} ${plural(h, ["час", "часа", "часов"])}`;
  }
  f.goal = `${pctStr(p / target)} всей цели «${G}»`;

  const eqA = f.rent || f.habit || f.stage || f.goal;
  const eqB = f.stage || f.habit || f.rent || f.goal;
  const pasta = Math.max(1, Math.floor(p / 89));
  const no = 100 + Math.floor(Math.random() * 900);

  const T = {
    zen: [
      () => `Сделай медленный вдох. «${name}» за ${fmt(p)} — это ${eqA}. Представь день, когда «${G}» случится: вы вдвоём и знаете, что смогли.\n\nЕсли через 48 часов желание не пройдёт, вернитесь к нему вместе. А пока пусть эти деньги поработают на вашу мечту 🌿`,
      () => `Пауза перед покупкой — уже победа.\n\n${fmt(p)} — это ${eqB}. Хотеть «${name}» нормально, но «${G}» — ваше общее большое «хочу». Отпусти импульс и оставь место для мечты 🤍`,
    ],
    batya: [
      () => `«${name}»? За ${fmt(p)}?! Ты чё, Рокфеллер? Дома макароны есть!\n\nНа эти деньги — ${pasta} ${plural(pasta, ["пачка", "пачки", "пачек"])} макарон. А «${G}» кто оплачивать будет, Пушкин? Деньги в копилку. Бегом.`,
      () => `Я в твои годы на гречке сидел и не жаловался. А тут — «${name}» за ${fmt(p)}.\n\nЭто ${eqA}!${f.delay ? ` И цель отъезжает на ${f.delay}.` : ""} Дома макароны есть. Отбой.`,
      () => `Ага, щас. ${fmt(p)} на «${name}». А потом: «пап, мы не успеваем к ${D}».\n\nЭто ${eqB}, между прочим. Макароны с кетчупом — тоже ресторан, если с правильным настроем. Закрыл приложение. Молодец.`,
    ],
    buh: [
      () => [
        `Служебная записка № ${no}`,
        `Предмет: «${name}», ${fmt(p)}`,
        ``,
        f.stage && `• ${f.stage}`,
        f.rent && `• ${f.rent}`,
        f.habit && `• ${f.habit}`,
        `• ${f.goal}`,
        ``,
        perDay > 0 ? `План: ${fmt(perDay)} в день до ${D}. Покупка сдвигает цель на ${f.delay}.` : `Цель уже собрана. Но это не повод.`,
        ``,
        `Заключение: в покупке отказать.`,
      ].filter((l) => typeof l === "string").join("\n"),
      () => `Расчёт № ${no}\n\nЦель «${G}»: ${fmt(target)}. Осталось: ${fmt(remaining)}. Дней до ${D}: ${daysLeft}.\nНорма накоплений: ${fmt(perDay)} в день.\n\n«${name}» = ${perDay > 0 ? n1(p / perDay) : "∞"} дневных норм = ${eqB}.\n\nЭмоциональная ценность покупки в отчётность не входит. Рекомендация: отклонить, сумму направить в копилку.`,
    ],
  };
  return pick(T[persona])().replace(/\n{3,}/g, "\n\n");
}

/* ═══════════════════════════ Базовые UI-кусочки ═══════════════════════════ */

const card = "bg-white rounded-3xl border border-slate-200 shadow-soft";
const inputCls = "w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-[15px] text-slate-900 outline-none transition-all focus:border-ink focus:bg-white focus:ring-4 focus:ring-sage-soft placeholder:text-slate-400";

function Avatar({ partner, size = "w-10 h-10" }) {
  const a = avatarOf(partner);
  return (
    <div className={`${size} ${a.bg} rounded-full ring-2 ring-cream overflow-hidden flex items-end justify-center shrink-0`}>
      <img src={a.src} alt="" draggable="false" className="w-[88%] h-[88%] object-contain select-none" />
    </div>
  );
}

// Огонёк — только ИИ-помощник. Пока есть одно нейтральное изображение, без отдельных эмоций.
function AiAvatar({ size = "w-9 h-9" }) {
  return (
    <div className={`${size} bg-honey-soft rounded-full overflow-hidden flex items-end justify-center shrink-0`}>
      <img src={IMG.ogonek} alt="Огонёк" draggable="false" className="w-[88%] h-[88%] object-contain select-none" />
    </div>
  );
}

function Label({ children, hint }) {
  return (
    <div className="flex items-baseline justify-between gap-2 mb-1">
      <span className="text-[13px] text-slate-500 font-medium">{children}</span>
      {hint && <span className="text-[13px] text-slate-400">{hint}</span>}
    </div>
  );
}

function MoneyInput({ id, value, onChange, placeholder = "0", big = false, className = "", maxDigits = 8 }) {
  return (
    <div className={`relative ${className}`}>
      <input
        id={id}
        inputMode="numeric"
        value={value ? Number(value).toLocaleString("ru-RU") : ""}
        placeholder={placeholder}
        onChange={(e) => onChange(Number(e.target.value.replace(/\D/g, "").slice(0, maxDigits)) || 0)}
        className={`${inputCls} pr-9 tabnum ${big ? "text-2xl font-bold py-3.5" : "font-semibold"}`}
      />
      <span className={`absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-semibold ${big ? "text-xl" : ""}`}>₽</span>
    </div>
  );
}

function Segmented({ options, value, onChange, cols }) {
  return (
    <div className="grid gap-1 bg-slate-100 p-1 rounded-2xl" style={{ gridTemplateColumns: `repeat(${cols || options.length}, minmax(0, 1fr))` }}>
      {options.map((o) => (
        <button
          type="button"
          key={o.id}
          onClick={() => onChange(o.id)}
          className={`py-2 px-1 text-[15px] rounded-xl transition-all active:scale-95 ${value === o.id ? "bg-white shadow-soft font-semibold text-slate-900" : "text-slate-500"}`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

function Toggle({ checked, onChange, id }) {
  return (
    <button
      id={id}
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative w-12 h-7 rounded-full transition-all shrink-0 ${checked ? "bg-emerald-500" : "bg-slate-200"}`}
    >
      <span className={`absolute top-0.5 w-6 h-6 rounded-full bg-white shadow transition-all ${checked ? "left-[22px]" : "left-0.5"}`} />
    </button>
  );
}

function Sheet({ title, subtitle, icon: Icon, iconTone = "bg-indigo-50 text-indigo-600", lead, onClose, children }) {
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);
  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-slate-900/25 backdrop-blur-[2px] anim-fade" onClick={onClose} />
      <div
        className="absolute bottom-0 inset-x-0 max-w-md mx-auto bg-white rounded-t-3xl shadow-sheet anim-sheet max-h-[92vh] overflow-y-auto"
        style={{ paddingBottom: "max(20px, env(safe-area-inset-bottom))" }}
      >
        <div className="sticky top-0 bg-white/95 backdrop-blur px-5 pt-2.5 pb-3 z-10">
          <div className="w-10 h-1 rounded-full bg-slate-200 mx-auto mb-3" />
          <div className="flex items-center gap-3">
            {lead || (Icon && <div className={`w-10 h-10 rounded-2xl ${iconTone} flex items-center justify-center`}><Icon size={20} /></div>)}
            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-bold text-slate-900 leading-tight">{title}</h2>
              {subtitle && <p className="text-[15px] text-slate-500">{subtitle}</p>}
            </div>
            <button onClick={onClose} aria-label="Закрыть" className="w-11 h-11 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center transition-all active:scale-90 hover:bg-slate-200">
              <X size={18} />
            </button>
          </div>
        </div>
        <div className="px-5">{children}</div>
      </div>
    </div>
  );
}

/* ═══════════════════════════ Редакторы (общие для онбординга и настроек) ═══════════════════════════ */

function PartnersEditor({ partners, onChange, meId }) {
  const set = (i, patch) => onChange(partners.map((p, j) => (i === j ? { ...p, ...patch } : p)));
  return (
    <div className="space-y-3">
      {partners.map((p, i) => (
        <div key={p.id} className={`${card} p-4`}>
          <div className="flex items-center gap-3">
            <Avatar partner={p} size="w-12 h-12 text-lg" />
            <div className="flex-1 min-w-0">
              <Label>{p.id === meId ? "Вы" : meId ? "Ваш партнёр" : `Партнёр ${i + 1}`}</Label>
              <input id={`name-${p.id}`} value={p.name} maxLength={20} onChange={(e) => set(i, { name: e.target.value })} placeholder="Имя" className={inputCls} />
            </div>
          </div>
          <div className="mt-3">
            <Label>Персонаж</Label>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(AVATARS).map(([key, a]) => {
                const on = avatarKey(p) === key;
                return (
                  <button
                    type="button"
                    key={key}
                    aria-pressed={on}
                    onClick={() => set(i, { avatar: key })}
                    className={`flex items-center gap-2.5 p-2 min-h-[52px] rounded-2xl border-2 text-left transition-all active:scale-95 ${on ? "border-ink bg-sage-soft" : "border-slate-200 bg-white"}`}
                  >
                    <span className={`w-10 h-10 rounded-full ${a.bg} overflow-hidden flex items-end justify-center shrink-0`}>
                      <img src={a.src} alt="" draggable="false" className="w-[88%] h-[88%] object-contain" />
                    </span>
                    <span className="text-[15px] font-medium text-slate-900">{a.name}</span>
                    {on && <Check size={16} className="ml-auto text-ink shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function GoalBasicsEditor({ goal, onChange, showPresets }) {
  const choose = (pr) =>
    onChange({ ...goal, preset: pr.id, title: pr.title || goal.title, stages: pr.stages.map((t) => ({ id: uid(), title: t, amount: 0 })) });
  const d = daysUntil(goal.date);
  return (
    <div className="space-y-4">
      {showPresets && (
        <div className="grid grid-cols-3 gap-2">
          {GOAL_PRESETS.map((pr) => (
            <button
              type="button"
              key={pr.id}
              onClick={() => choose(pr)}
              className={`rounded-2xl p-3 text-left border-2 transition-all active:scale-95 ${goal.preset === pr.id ? "border-emerald-400 bg-emerald-50/60" : "border-slate-200 bg-white"}`}
            >
              <div className="text-xl">{pr.emoji}</div>
              <div className="text-[13px] font-semibold text-slate-800 mt-1 leading-tight">{pr.title || "Своя цель"}</div>
            </button>
          ))}
        </div>
      )}
      <div>
        <Label>Как называется цель</Label>
        <input id="goal-title" value={goal.title} maxLength={32} onChange={(e) => onChange({ ...goal, title: e.target.value })} placeholder="Например: Переезд" className={inputCls} />
      </div>
      <div>
        <Label hint={goal.date && d > 0 ? `через ${daysText(d)}` : null}>К какой дате</Label>
        <input id="goal-date" type="date" min={addMonths(0)} value={goal.date} onChange={(e) => onChange({ ...goal, date: e.target.value })} className={inputCls} />
        <div className="mt-2 flex gap-2 flex-wrap">
          {[3, 6, 12].map((m) => (
            <button type="button" key={m} onClick={() => onChange({ ...goal, date: addMonths(m) })} className="px-3 py-1.5 rounded-full text-[13px] border border-slate-200 text-slate-600 transition-all active:scale-95 hover:bg-slate-50">
              Через {m === 12 ? "год" : `${m} мес.`}
            </button>
          ))}
        </div>
        {goal.date && d <= 0 && <p className="mt-2 text-[13px] text-rose-500">Выберите дату в будущем</p>}
      </div>
    </div>
  );
}

function StagesEditor({ goal, onChange }) {
  const stages = goal.stages;
  const set = (i, patch) => onChange({ ...goal, stages: stages.map((s, j) => (i === j ? { ...s, ...patch } : s)) });
  const remove = (i) => onChange({ ...goal, stages: stages.filter((_, j) => j !== i) });
  const add = () => onChange({ ...goal, stages: [...stages, { id: uid(), title: "", amount: 0 }] });
  return (
    <div className="space-y-3">
      {stages.map((s, i) => {
        const Icon = stageIcon(s.title);
        return (
          <div key={s.id} className={`${card} p-3`}>
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <Icon size={17} />
              </div>
              <input id={`stage-title-${s.id}`} value={s.title} maxLength={40} onChange={(e) => set(i, { title: e.target.value })} placeholder={`Этап ${i + 1}`} className={`${inputCls} py-2.5`} />
              <button
                type="button"
                onClick={() => remove(i)}
                disabled={stages.length === 1}
                aria-label="Удалить этап"
                className="w-10 h-10 rounded-xl text-slate-400 flex items-center justify-center shrink-0 transition-all active:scale-90 hover:text-rose-500 hover:bg-rose-50 disabled:opacity-30"
              >
                <Trash2 size={17} />
              </button>
            </div>
            <MoneyInput id={`stage-amount-${s.id}`} value={s.amount} onChange={(v) => set(i, { amount: v })} placeholder="Сколько нужно" className="mt-2" />
          </div>
        );
      })}
      <button type="button" onClick={add} className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl border-2 border-dashed border-slate-200 text-slate-500 text-[15px] font-medium transition-all active:scale-95 hover:border-emerald-300 hover:text-emerald-600">
        <Plus size={16} /> Добавить этап
      </button>
      <div className="flex items-center justify-between bg-slate-900 text-white rounded-2xl px-4 py-3">
        <span className="text-[15px] text-slate-300">Итого цель</span>
        <Money value={goalTotal(goal)} className="text-lg font-bold" />
      </div>
    </div>
  );
}

function StartEditor({ partners, onChange, target }) {
  const total = sum(partners.map((p) => ({ amount: p.start })));
  const pct = target ? Math.min(100, (total / target) * 100) : 0;
  return (
    <div className="space-y-3">
      {partners.map((p, i) => (
        <div key={p.id} className={`${card} p-4 flex items-center gap-3`}>
          <Avatar partner={p} size="w-11 h-11 text-base" />
          <div className="flex-1 min-w-0">
            <Label>{p.name || `Партнёр ${i + 1}`} уже отложил(а)</Label>
            <MoneyInput id={`start-${p.id}`} value={p.start} onChange={(v) => onChange(partners.map((x, j) => (i === j ? { ...x, start: v } : x)))} />
          </div>
        </div>
      ))}
      <div className={`${card} p-4`}>
        <div className="flex justify-between text-[15px]">
          <span className="text-slate-500">Стартуете с</span>
          <span className="font-semibold tabnum">{fmt(total)} из {fmt(target)}</span>
        </div>
        <div className="mt-2 h-2.5 bg-slate-100 rounded-full overflow-hidden">
          <div className="h-full bg-emerald-500 rounded-full transition-all duration-700" style={{ width: `${pct}%` }} />
        </div>
      </div>
    </div>
  );
}

function HabitsEditor({ habits, onChange }) {
  const [label, setLabel] = useState("");
  const [amount, setAmount] = useState(0);
  const has = (lib) => habits.some((h) => h.libId === lib.id);
  const toggle = (lib) =>
    has(lib)
      ? onChange(habits.filter((h) => h.libId !== lib.id))
      : onChange([...habits, { id: uid(), libId: lib.id, emoji: lib.emoji, label: lib.label, amount: lib.amount, win: lib.win, challenge: lib.challenge }]);
  const set = (id, patch) => onChange(habits.map((h) => (h.id === id ? { ...h, ...patch } : h)));
  const addCustom = () => {
    const l = label.trim();
    if (!l || amount <= 0) return;
    onChange([...habits, { id: uid(), libId: null, emoji: "💸", label: l, amount, win: `Обошлись без: ${l.toLowerCase()}`, challenge: `Неделя без: ${l.toLowerCase()}` }]);
    setLabel(""); setAmount(0);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {HABIT_LIBRARY.map((lib) => (
          <button
            type="button"
            key={lib.id}
            onClick={() => toggle(lib)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-[15px] border transition-all active:scale-95 ${has(lib) ? "border-emerald-400 bg-emerald-50 text-emerald-800 font-medium" : "border-slate-200 bg-white text-slate-600"}`}
          >
            <span>{lib.emoji}</span> {lib.label}
            {has(lib) && <Check size={14} className="text-emerald-600" />}
          </button>
        ))}
      </div>

      {habits.length > 0 && (
        <div className="space-y-2">
          <Label hint="поправьте под себя">Сколько уходит за один раз</Label>
          {habits.map((h) => (
            <div key={h.id} className={`${card} rounded-2xl p-2.5 flex items-center gap-2`}>
              <span className="w-9 h-9 rounded-xl bg-slate-50 flex items-center justify-center text-lg shrink-0">{h.emoji}</span>
              <span className="flex-1 min-w-0 text-[15px] font-medium text-slate-800 truncate">{h.label}</span>
              <MoneyInput id={`habit-${h.id}`} value={h.amount} onChange={(v) => set(h.id, { amount: v })} className="w-[120px] shrink-0" />
              <button type="button" aria-label="Убрать" onClick={() => onChange(habits.filter((x) => x.id !== h.id))} className="w-9 h-9 rounded-xl text-slate-400 flex items-center justify-center shrink-0 transition-all active:scale-90 hover:text-rose-500">
                <X size={16} />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="rounded-2xl border-2 border-dashed border-slate-200 p-3">
        <Label>Своя статья трат</Label>
        <div className="flex gap-2">
          <input id="habit-custom-label" value={label} maxLength={30} onChange={(e) => setLabel(e.target.value)} placeholder="Например: цветы" className={`${inputCls} py-2.5`} />
          <MoneyInput id="habit-custom-amount" value={amount} onChange={setAmount} className="w-[110px] shrink-0" />
        </div>
        <button type="button" onClick={addCustom} disabled={!label.trim() || amount <= 0} className="mt-2 w-full py-2.5 rounded-xl bg-slate-900 text-white text-[15px] font-medium transition-all active:scale-95 disabled:bg-slate-100 disabled:text-slate-400">
          Добавить
        </button>
      </div>
    </div>
  );
}

function BudgetEditor({ budget, onChange }) {
  return (
    <div className={`${card} p-4 space-y-3`}>
      <div className="flex items-start gap-3">
        <div className="flex-1">
          <div className="text-[15px] font-semibold text-slate-900">Бюджет на день без чувства вины</div>
          <p className="text-[13px] text-slate-500 mt-0.5">Сумма, которую можно тратить спокойно. Что не потратили — одним касанием в копилку.</p>
        </div>
        <Toggle id="budget-toggle" checked={budget.enabled} onChange={(v) => onChange({ ...budget, enabled: v })} />
      </div>
      {budget.enabled && (
        <div className="anim-rise space-y-2">
          <MoneyInput id="budget-amount" value={budget.amount} onChange={(v) => onChange({ ...budget, amount: v })} placeholder="На двоих в день" big />
          <div className="flex gap-2 flex-wrap">
            {[500, 1000, 1500, 2000].map((v) => (
              <button type="button" key={v} onClick={() => onChange({ ...budget, amount: v })} className={`px-3 py-1.5 rounded-full text-[15px] tabnum border transition-all active:scale-95 ${budget.amount === v ? "border-slate-900 bg-slate-900 text-white" : "border-slate-200 text-slate-600"}`}>
                {v.toLocaleString("ru-RU")} ₽
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function PersonaEditor({ persona, onChange }) {
  return (
    <div className="grid grid-cols-3 gap-2">
      {PERSONAS.map((p) => (
        <button
          type="button"
          key={p.id}
          onClick={() => onChange(p.id)}
          className={`rounded-2xl p-3 text-center border-2 transition-all active:scale-95 ${persona === p.id ? "border-indigo-400 bg-indigo-50/60" : "border-slate-200 bg-white"}`}
        >
          <div className="text-2xl">{p.emoji}</div>
          <div className="text-[12px] font-semibold text-slate-800 mt-1 leading-tight">{p.name}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">{p.hint}</div>
        </button>
      ))}
    </div>
  );
}

const valid = {
  partners: (ps) => ps.every((p) => p.name.trim()),
  basics: (g) => !!g.title.trim() && !!g.date && daysUntil(g.date) > 0,
  stages: (g) => g.stages.length > 0 && g.stages.every((s) => s.title.trim() && s.amount > 0),
  habits: (hs) => hs.every((h) => h.label.trim() && h.amount > 0),
  budget: (b) => !b.enabled || b.amount > 0,
};

/* ═══════════════════════════ Онбординг ═══════════════════════════ */

function Onboarding({ onFinish }) {
  const [step, setStep] = useState(0);
  const [d, setD] = useState({
    partners: [
      { id: "p1", name: "", avatar: "peach", start: 0 },
      { id: "p2", name: "", avatar: "sage", start: 0 },
    ],
    goal: { preset: null, title: "", date: "", stages: [{ id: uid(), title: "", amount: 0 }] },
    habits: [],
    budget: { enabled: true, amount: 0 },
    persona: "zen",
  });
  const patch = (p) => setD((x) => ({ ...x, ...p }));
  const names = d.partners.map((p) => p.name.trim()).filter(Boolean);

  const steps = [
    {
      title: "Кто копит?",
      sub: "Копилка будет общей: после настройки пригласите партнёра, и у вас обоих всё будет одинаковым на любых устройствах.",
      body: <PartnersEditor partners={d.partners} meId="p1" onChange={(partners) => patch({ partners })} />,
      ok: valid.partners(d.partners),
    },
    {
      title: "На что копим?",
      sub: "Выберите шаблон или придумайте свою цель. Название и дату задаёте вы.",
      body: <GoalBasicsEditor goal={d.goal} onChange={(goal) => patch({ goal })} showPresets />,
      ok: valid.basics(d.goal),
    },
    {
      title: "Из чего состоит цель?",
      sub: "Разбейте сумму на этапы — так прогресс видно раньше. Названия можно менять, суммы вписываете вы.",
      body: <StagesEditor goal={d.goal} onChange={(goal) => patch({ goal })} />,
      ok: valid.stages(d.goal),
    },
    {
      title: "Что уже отложено?",
      sub: "Если начинаете с нуля, просто идите дальше.",
      body: <StartEditor partners={d.partners} target={goalTotal(d.goal)} onChange={(partners) => patch({ partners })} />,
      ok: true,
    },
    {
      title: "Куда утекают деньги?",
      sub: "Отметьте только то, что у вас правда есть. Из этого соберутся быстрые кнопки «сэкономили» и челленджи.",
      body: <HabitsEditor habits={d.habits} onChange={(habits) => patch({ habits })} />,
      ok: valid.habits(d.habits),
      skip: d.habits.length === 0 ? "У нас такого нет" : null,
    },
    {
      title: "Правила игры",
      sub: "Дневной бюджет можно выключить. Характер ИИ меняется в любой момент.",
      body: (
        <div className="space-y-4">
          <BudgetEditor budget={d.budget} onChange={(budget) => patch({ budget })} />
          <div>
            <Label>Кто будет вас отговаривать</Label>
            <PersonaEditor persona={d.persona} onChange={(persona) => patch({ persona })} />
          </div>
        </div>
      ),
      ok: valid.budget(d.budget),
    },
  ];

  const finish = () => {
    const now = Date.now();
    const config = {
      partners: d.partners.map(({ start, ...p }) => ({ ...p, name: p.name.trim() })),
      goal: { ...d.goal, title: d.goal.title.trim(), stages: d.goal.stages.map((s) => ({ ...s, title: s.title.trim() })) },
      habits: d.habits,
      budget: d.budget,
      persona: d.persona,
    };
    const log = d.partners
      .filter((p) => p.start > 0)
      .map((p, i) => ({ id: uid(), ts: now - i, type: "deposit", who: p.id, title: "Стартовые накопления", amount: p.start }));
    onFinish({ config, log, challenge: newChallenge(d.habits, null) });
  };

  if (step === 0) {
    return (
      <div className="max-w-md mx-auto min-h-screen flex flex-col px-5 pt-14 pb-8">
        <div className="flex -space-x-3">
          <Avatar partner={{ id: "p1", avatar: "peach", name: "" }} size="w-16 h-16" />
          <Avatar partner={{ id: "p2", avatar: "sage", name: "" }} size="w-16 h-16" />
        </div>
        <h1 className="mt-6 text-[32px] leading-[1.1] font-extrabold tracking-tight text-slate-900">Копилка на двоих</h1>
        <p className="mt-3 text-[15px] text-slate-600 leading-relaxed">
          Одна общая цель, понятные этапы и ИИ, который переводит импульсивные покупки в дни до вашей мечты.
        </p>
        <div className="mt-8 space-y-3">
          {[
            ["Цель и этапы", "Сумму, дату и шаги задаёте вы"],
            ["Ваши привычки", "Кнопки «сэкономили» только из ваших реальных трат"],
            ["Общая на двоих", "Открываете с разных телефонов — всё синхронно"],
          ].map(([t, s]) => (
            <div key={t} className="flex gap-3">
              <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0 mt-0.5"><Check size={14} strokeWidth={3} /></div>
              <div>
                <div className="text-[15px] font-semibold text-slate-900">{t}</div>
                <div className="text-[15px] text-slate-500">{s}</div>
              </div>
            </div>
          ))}
        </div>
        <div className="flex-1" />
        {IN_TG && (
          <p className="text-[15px] text-slate-600 bg-white border border-slate-200 rounded-2xl px-4 py-3 mb-3">
            Партнёр уже завёл копилку? Тогда не начинайте новую, а откройте ссылку-приглашение от него.
          </p>
        )}
        <p className="text-[13px] text-slate-400 mb-3">Займёт пару минут. Всё можно поменять потом в настройках.</p>
        <button onClick={() => setStep(1)} className="w-full bg-emerald-500 text-white text-base font-semibold rounded-2xl py-4 transition-all active:scale-95 hover:bg-emerald-600">
          Настроить под нас
        </button>
      </div>
    );
  }

  const s = steps[step - 1];
  const last = step === steps.length;
  return (
    <div className="max-w-md mx-auto min-h-screen flex flex-col">
      <div className="px-5 pt-5">
        <div className="flex items-center gap-3">
          <button onClick={() => setStep(step - 1)} aria-label="Назад" className="w-10 h-10 rounded-full bg-white border border-slate-200 shadow-soft flex items-center justify-center text-slate-600 transition-all active:scale-90">
            <ChevronLeft size={20} />
          </button>
          <div className="flex-1 grid gap-1.5" style={{ gridTemplateColumns: `repeat(${steps.length}, minmax(0, 1fr))` }}>
            {steps.map((_, i) => (
              <div key={i} className={`h-1.5 rounded-full transition-all duration-500 ${i < step ? "bg-emerald-500" : "bg-slate-200"}`} />
            ))}
          </div>
          <span className="text-[13px] text-slate-400 tabnum w-9 text-right">{step}/{steps.length}</span>
        </div>
        {step > 1 && names.length === 2 && (
          <div className="mt-4 flex items-center gap-2 text-[13px] text-slate-500">
            <div className="flex -space-x-2">{d.partners.map((p) => <Avatar key={p.id} partner={p} size="w-6 h-6 text-[11px]" />)}</div>
            {names.join(" и ")}{d.goal.title.trim() && step > 2 ? ` · ${d.goal.title.trim()}` : ""}
          </div>
        )}
        <h1 className="mt-4 text-2xl font-extrabold tracking-tight text-slate-900">{s.title}</h1>
        <p className="mt-1 text-[15px] text-slate-500 leading-relaxed">{s.sub}</p>
      </div>

      <div key={step} className="px-5 pt-5 pb-32 anim-rise">{s.body}</div>

      <div className="fixed bottom-0 inset-x-0 z-30">
        <div className="max-w-md mx-auto bg-slate-50/90 backdrop-blur-xl px-5 pt-3 border-t border-slate-200" style={{ paddingBottom: "max(16px, env(safe-area-inset-bottom))" }}>
          <button
            onClick={() => (last ? finish() : setStep(step + 1))}
            disabled={!s.ok}
            className="w-full bg-emerald-500 text-white text-base font-semibold rounded-2xl py-3.5 transition-all active:scale-95 hover:bg-emerald-600 disabled:bg-slate-200 disabled:text-slate-400"
          >
            {last ? "Запустить копилку" : s.skip || "Дальше"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════ Дашборд ═══════════════════════════ */

function HabitChips({ habits, onWin }) {
  return (
    <div className="flex flex-wrap gap-2">
      {habits.map((h) => (
        <button
          key={h.id}
          onClick={() => onWin(h)}
          className="flex items-center gap-1.5 pl-2.5 pr-3 py-2 rounded-full bg-white border border-emerald-200 text-[15px] text-slate-700 transition-all active:scale-95 hover:border-emerald-400 hover:bg-emerald-50"
        >
          <span>{h.emoji}</span>
          <span>{h.win}</span>
          <span className="font-semibold text-emerald-600 tabnum">+{h.amount.toLocaleString("ru-RU")} ₽</span>
        </button>
      ))}
    </div>
  );
}

function Dashboard({ config, total, deposits, saved, budgetLeft, spentToday, banked, challenge, onBank, onWin, onOpenAi, onOpenAdd, pulse, goTab }) {
  const { goal, partners, habits, budget } = config;
  const target = goalTotal(goal);
  const daysLeft = Math.max(0, daysUntil(goal.date));
  const pct = Math.min(100, (total / target) * 100);
  const remaining = Math.max(0, target - total);
  const perDay = daysLeft > 0 ? remaining / daysLeft : remaining;

  let before = 0;
  const stages = goal.stages.map((s) => {
    const filled = Math.min(s.amount, Math.max(0, total - before));
    const row = { ...s, filled, start: before };
    before += s.amount;
    return row;
  });
  const ticks = stages.slice(0, -1).map((s) => ((s.start + s.amount) / target) * 100);

  const spentPct = budget.enabled ? Math.min(100, (spentToday / budget.amount) * 100) : 0;
  const bankedPct = budget.enabled ? Math.min(100 - spentPct, (banked / budget.amount) * 100) : 0;
  const over = budgetLeft < 0;
  const rentStage = goal.stages.find((s) => /аренд/i.test(s.title));
  const habit = habits.find((h) => h.id === challenge?.habitId);
  const chDone = countDays(challenge);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 bg-amber-50 border border-amber-100 rounded-2xl px-4 py-3">
        <CalendarDays size={18} className="text-amber-600 shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="text-[15px] text-amber-900 truncate">До цели «{goal.title}»</div>
          <div className="text-[13px] text-amber-700/70">{dateLong(goal.date)}</div>
        </div>
        <span className="text-[15px] font-bold text-amber-700 tabnum shrink-0">{daysLeft > 0 ? daysText(daysLeft) : "сегодня!"}</span>
      </div>

      <section key={`p${pulse}`} className={`${card} p-5 ${pulse ? "anim-pop" : ""}`}>
        <div className="flex items-center justify-between gap-2">
          <span className="text-[13px] uppercase tracking-[0.12em] text-slate-400 font-semibold truncate">Операция «{monthName(goal.date)}»</span>
          <span className="text-[13px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full tabnum">{Math.floor(pct)}%</span>
        </div>
        <div className="mt-3 flex items-baseline gap-2 flex-wrap">
          <Money value={total} className="text-[38px] leading-none font-extrabold tracking-tight text-slate-900" />
          <span className="text-slate-400 text-[15px] tabnum">из {fmt(target)}</span>
        </div>
        <div className="relative mt-4 h-3 bg-slate-100 rounded-full overflow-hidden">
          <div className="absolute inset-y-0 left-0 bg-emerald-500 rounded-full transition-all duration-700 ease-out" style={{ width: `${pct}%` }} />
          {ticks.map((t, i) => <div key={i} className="absolute inset-y-0 w-0.5 bg-white/90" style={{ left: `${t}%` }} />)}
        </div>
        <div className="mt-4 grid grid-cols-1 min-[360px]:grid-cols-3 gap-2">
          {[
            ...partners.map((p) => ({ key: p.id, label: p.name, value: deposits[p.id] || 0, dot: barOf(p, partners) })),
            { key: "saved", label: "Спасено", value: saved, dot: "bg-emerald-300" },
          ].map((x) => (
            <div key={x.key} className="bg-slate-50 rounded-2xl px-3 py-2.5 min-w-0">
              <div className="flex items-center gap-1.5 text-[13px] text-slate-500 min-w-0">
                <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${x.dot}`} />
                <span className="truncate">{x.label}</span>
              </div>
              <Money value={x.value} className="block text-[15px] font-semibold text-slate-800 whitespace-nowrap" />
            </div>
          ))}
        </div>
        <p className="mt-3 text-[13px] text-slate-500 tabnum">
          {remaining > 0 ? <>Осталось {fmt(remaining)} · по {fmt(perDay)} в день до {dateShort(goal.date)}</> : <>Цель собрана! Вы молодцы 🎉</>}
        </p>
      </section>

      <section className={`${card} p-5`}>
        <div className="flex items-center justify-between">
          <h2 className="text-[15px] font-bold text-slate-900">Этапы</h2>
          <button onClick={() => goTab("settings")} className="text-[13px] text-slate-400 flex items-center gap-1 transition-all active:scale-95 hover:text-slate-600">
            <Pencil size={12} /> Изменить
          </button>
        </div>
        <ol className="mt-4">
          {stages.map((s, i) => {
            const done = s.filled >= s.amount;
            const active = !done && s.filled > 0;
            const Icon = stageIcon(s.title);
            return (
              <li key={s.id} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-500 ${done ? "bg-emerald-500 text-white" : active ? "bg-emerald-50 text-emerald-600 ring-2 ring-emerald-200" : "bg-slate-100 text-slate-400"}`}>
                    {done ? <Check size={17} strokeWidth={3} /> : <Icon size={16} />}
                  </div>
                  {i < stages.length - 1 && <div className={`w-0.5 flex-1 min-h-[14px] my-1 rounded-full ${done ? "bg-emerald-300" : "bg-slate-100"}`} />}
                </div>
                <div className="flex-1 min-w-0 pb-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className={`text-[15px] font-semibold ${done || active ? "text-slate-900" : "text-slate-500"}`}>{s.title}</div>
                      <div className="text-[13px] text-slate-500 tabnum mt-0.5">{active ? <>{fmt(s.filled)} из {fmt(s.amount)}</> : fmt(s.amount)}</div>
                    </div>
                    <span className={`shrink-0 inline-flex items-center gap-1 text-[13px] font-semibold px-2 py-1 rounded-full ${done ? "bg-emerald-50 text-emerald-700" : active ? "bg-indigo-50 text-indigo-600" : "bg-slate-100 text-slate-500"}`}>
                      {done ? <Check size={12} /> : active ? <CircleDot size={12} /> : <Clock size={12} />}
                      {done ? "Выполнено" : active ? "В процессе" : "Ожидает"}
                    </span>
                  </div>
                  {active && (
                    <div className="mt-2 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full transition-all duration-700" style={{ width: `${(s.filled / s.amount) * 100}%` }} />
                    </div>
                  )}
                </div>
              </li>
            );
          })}
        </ol>
      </section>

      <button onClick={onOpenAi} className="w-full text-left bg-indigo-600 rounded-3xl p-5 text-white transition-all active:scale-[0.98] hover:bg-indigo-700">
        <div className="flex items-center gap-2.5 text-indigo-100 text-[13px] font-semibold"><AiAvatar size="w-9 h-9" /> Огонёк · ИИ</div>
        <div className="mt-2 text-lg font-bold leading-snug">Хочется купить импульсивную дичь?</div>
        <div className="mt-1 text-[15px] text-indigo-100">Сначала спроси. Переведу цену в этапы «{goal.title}» и дни до цели.</div>
        <div className="mt-4 inline-flex items-center gap-1.5 bg-white text-indigo-700 font-semibold text-[15px] px-4 py-2 rounded-full">Отговори меня <ChevronRight size={16} /></div>
      </button>

      {budget.enabled && (
        <section className={`${card} p-5`}>
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-[15px] font-bold text-slate-900 leading-snug">Бюджет на сегодня без чувства вины</h2>
              <p className="text-[13px] text-slate-500 mt-0.5">{fmt(budget.amount)} на двоих</p>
            </div>
            <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0"><Heart size={18} /></div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <Money value={budgetLeft} className={`text-3xl font-extrabold ${over ? "text-rose-500" : "text-slate-900"}`} />
            <span className="text-[15px] text-slate-400">{over ? "перерасход" : "осталось"}</span>
          </div>
          <div className="mt-3 h-2.5 bg-slate-100 rounded-full overflow-hidden flex">
            <div className={`h-full transition-all duration-700 ${over ? "bg-rose-500" : "bg-amber-400"}`} style={{ width: `${spentPct}%` }} />
            <div className="h-full bg-emerald-400 transition-all duration-700" style={{ width: `${bankedPct}%` }} />
          </div>
          <div className="mt-2 flex justify-between text-[13px] text-slate-500 tabnum">
            <span>Потрачено {fmt(spentToday)}</span>
            {banked > 0 && <span className="text-emerald-600">В копилке {fmt(banked)}</span>}
          </div>
          {banked > 0 ? (
            <div className="mt-4 flex items-center gap-2 bg-emerald-50 text-emerald-700 text-[15px] rounded-2xl px-4 py-3"><Check size={16} /> Остаток уже в копилке. Завтра новый лимит.</div>
          ) : (
            <div className="mt-4 grid grid-cols-[1fr_auto] gap-2">
              <button onClick={onBank} disabled={budgetLeft <= 0} className="flex items-center justify-center gap-2 bg-emerald-500 text-white font-semibold text-base rounded-2xl py-3 transition-all active:scale-95 hover:bg-emerald-600 disabled:bg-slate-200 disabled:text-slate-400">
                <PiggyBank size={17} /> Сэкономили сегодня
              </button>
              <button onClick={() => onOpenAdd("out")} className="px-4 rounded-2xl bg-slate-100 text-slate-600 text-[15px] font-medium transition-all active:scale-95 hover:bg-slate-200">Трата</button>
            </div>
          )}
        </section>
      )}

      <section className="rounded-3xl bg-emerald-50 border border-emerald-100 p-5">
        <div className="flex items-center gap-2 text-emerald-700 text-[15px] font-medium"><PiggyBank size={17} /> Вы уже спасли от импульсивных покупок</div>
        <Money value={saved} className="block mt-2 text-3xl font-extrabold text-emerald-700" />
        <p className="text-[13px] text-emerald-800/70 mt-1 tabnum">
          {saved === 0
            ? "Первая спасённая сумма появится здесь"
            : rentStage
            ? `Это ≈ ${n1(saved / (rentStage.amount / 30))} ${dayWord(saved / (rentStage.amount / 30))} жизни в новой квартире`
            : `Это ${pctStr(saved / target)} цели «${goal.title}»`}
        </p>
        <div className="mt-4">
          {habits.length ? (
            <HabitChips habits={habits} onWin={onWin} />
          ) : (
            <button onClick={() => goTab("settings")} className="w-full text-left text-[15px] text-emerald-800 bg-white/70 border border-dashed border-emerald-200 rounded-2xl px-4 py-3 transition-all active:scale-95">
              Добавьте свои статьи трат в настройках — здесь появятся кнопки «сэкономили» в одно касание
            </button>
          )}
        </div>
      </section>

      {habit && (
        <button onClick={() => goTab("stats")} className={`${card} w-full p-4 flex items-center gap-3 text-left transition-all active:scale-[0.98]`}>
          <div className="w-11 h-11 rounded-2xl bg-indigo-50 flex items-center justify-center shrink-0 text-xl">{habit.emoji}</div>
          <div className="flex-1 min-w-0">
            <div className="text-[13px] text-indigo-600 font-semibold">Челлендж недели</div>
            <div className="text-[15px] font-semibold text-slate-900 truncate">{habit.challenge}</div>
          </div>
          <span className="text-[15px] font-bold text-slate-700 tabnum">{chDone}/7</span>
          <ChevronRight size={18} className="text-slate-300" />
        </button>
      )}
    </div>
  );
}

/* ═══════════════════════════ Челленджи и аналитика ═══════════════════════════ */

function Challenges({ config, log, deposits, saved, challenge, onToggleDay, onNextChallenge, onReward, onWin, goTab }) {
  const { habits, partners } = config;
  const habit = habits.find((h) => h.id === challenge?.habitId);
  const days = challenge?.days || {};
  const done = countDays(challenge);
  const complete = done === 7;
  const tIdx = todayIdx();

  const savedBy = { ai: 0, habit: 0, budget: 0 };
  log.filter((e) => e.type === "saved").forEach((e) => { savedBy[e.kind] = (savedBy[e.kind] || 0) + e.amount; });
  const impulse = log.filter((e) => e.type === "expense" && e.impulse);
  const impulseSpent = sum(impulse);
  const talkedOut = log.filter((e) => e.type === "saved" && e.kind === "ai").length;
  const winRate = talkedOut + impulse.length ? Math.round((talkedOut / (talkedOut + impulse.length)) * 100) : null;
  const both = partners.reduce((s, p) => s + (deposits[p.id] || 0), 0);
  const maxSrc = Math.max(1, savedBy.ai, savedBy.habit, savedBy.budget);
  const vsMax = Math.max(1, saved, impulseSpent);

  const habitStats = habits
    .map((h) => ({ ...h, total: sum(log.filter((e) => e.type === "saved" && e.habitId === h.id)), count: log.filter((e) => e.type === "saved" && e.habitId === h.id).length }))
    .sort((a, b) => b.total - a.total);
  const maxHabit = Math.max(1, ...habitStats.map((h) => h.total));

  return (
    <div className="space-y-4">
      {habit ? (
        <section className={`${card} p-5`}>
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full"><Sparkles size={13} /> Челлендж недели от ИИ</span>
            {habits.length > 1 && (
              <button onClick={onNextChallenge} aria-label="Другой челлендж" className="w-11 h-11 -m-1.5 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center transition-all active:scale-90">
                <RefreshCw size={15} />
              </button>
            )}
          </div>
          <h2 className="mt-3 text-xl font-bold text-slate-900">{habit.emoji} {habit.challenge}</h2>
          <p className="text-[15px] text-slate-500 tabnum">
            {done}/7 {plural(done, ["день", "дня", "дней"])} · сэкономите до {fmt(habit.amount * 7)}
          </p>

          <div className="mt-4 grid grid-cols-7 gap-1.5">
            {WEEK.map((d, i) => {
              const on = days[i];
              const future = i > tIdx;
              const today = i === tIdx;
              return (
                <button key={d} disabled={future} onClick={() => onToggleDay(i)} className="flex flex-col items-center gap-1.5 transition-all active:scale-90 disabled:active:scale-100">
                  <div className={`w-full aspect-square max-w-[40px] rounded-xl flex items-center justify-center transition-all duration-300 ${on ? "bg-emerald-500 text-white" : today ? "border-2 border-dashed border-emerald-300 bg-emerald-50/50" : future ? "bg-slate-50" : "bg-slate-100"}`}>
                    {on && <Check size={16} strokeWidth={3} />}
                  </div>
                  <span className={`text-[13px] ${today ? "text-emerald-600 font-semibold" : "text-slate-400"}`}>{d}</span>
                </button>
              );
            })}
          </div>
          <p className="mt-2 text-[13px] text-slate-400">Нажмите на день, если продержались. Новая неделя начнётся сама.</p>

          <label className={`mt-4 flex items-center gap-3 rounded-2xl px-4 py-2.5 ${complete ? "bg-amber-100" : "bg-amber-50"}`}>
            <Trophy size={18} className="text-amber-600 shrink-0" />
            <span className="text-[15px] font-semibold text-amber-900 shrink-0">{complete ? "Награда открыта:" : "Награда:"}</span>
            <input id="reward" value={challenge.reward} maxLength={40} onChange={(e) => onReward(e.target.value)} className="flex-1 min-w-0 bg-transparent text-[15px] text-amber-900 outline-none border-b border-dashed border-amber-300 py-1" />
          </label>
        </section>
      ) : (
        <section className={`${card} p-5 text-center`}>
          <AiAvatar size="w-14 h-14 mx-auto" />
          <h2 className="mt-3 font-bold text-slate-900">Челленджам нужны ваши привычки</h2>
          <p className="mt-1 text-[15px] text-slate-500">Добавьте статьи трат, от которых хотите отвыкнуть, и ИИ соберёт недельное задание.</p>
          <button onClick={() => goTab("settings")} className="mt-4 px-5 py-2.5 rounded-2xl bg-indigo-600 text-white text-[15px] font-semibold transition-all active:scale-95">Добавить привычки</button>
        </section>
      )}

      <div className="grid grid-cols-3 gap-2">
        {[
          { label: "Спасено", value: <Money value={saved} />, tone: "text-emerald-600" },
          { label: "Импульсы", value: <Money value={impulseSpent} />, tone: "text-rose-500" },
          { label: "ИИ отговорил", value: <span className="tabnum">{winRate === null ? "—" : `${winRate}%`}</span>, tone: "text-indigo-600" },
        ].map((m) => (
          <div key={m.label} className={`${card} rounded-2xl px-3 py-3 min-w-0`}>
            <div className="text-[13px] text-slate-500">{m.label}</div>
            <div className={`text-[15px] font-bold mt-0.5 truncate ${m.tone}`}>{m.value}</div>
          </div>
        ))}
      </div>

      {habits.length > 0 && (
        <section className={`${card} p-5`}>
          <h2 className="text-[15px] font-bold text-slate-900">Быстрые победы</h2>
          <p className="text-[13px] text-slate-500 mt-0.5 mb-3">Одно касание — и деньги в спасённых</p>
          <HabitChips habits={habits} onWin={onWin} />
          {habitStats.some((h) => h.total > 0) && (
            <div className="mt-5 pt-4 border-t border-slate-200 space-y-2.5">
              <div className="text-[13px] font-semibold text-slate-400 uppercase tracking-[0.1em]">Где вы сильнее всего</div>
              {habitStats.filter((h) => h.total > 0).map((h) => (
                <div key={h.id} className="flex items-center gap-3">
                  <span className="w-5 text-center">{h.emoji}</span>
                  <span className="text-[15px] text-slate-600 w-28 truncate shrink-0">{h.label}</span>
                  <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full transition-all duration-700" style={{ width: `${(h.total / maxHabit) * 100}%` }} />
                  </div>
                  <span className="text-[13px] font-semibold text-slate-700 tabnum w-16 text-right">{fmt(h.total)}</span>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      <section className={`${card} p-5`}>
        <h2 className="text-[15px] font-bold text-slate-900">Спасли или сорвались</h2>
        {saved === 0 && impulseSpent === 0 ? (
          <p className="mt-2 text-[15px] text-slate-500">Пока пусто. Спросите ИИ-Отговорщика перед следующей спонтанной покупкой.</p>
        ) : (
          <>
            <div className="mt-4 space-y-3">
              {[
                { label: "Спасено от импульсов", value: saved, bar: "bg-emerald-500" },
                { label: "Всё равно купили", value: impulseSpent, bar: "bg-rose-400" },
              ].map((r) => (
                <div key={r.label}>
                  <div className="flex justify-between text-[15px]">
                    <span className="text-slate-600">{r.label}</span>
                    <Money value={r.value} className="font-semibold text-slate-900" />
                  </div>
                  <div className="mt-1.5 h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className={`h-full ${r.bar} rounded-full transition-all duration-700`} style={{ width: `${(r.value / vsMax) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-5 pt-4 border-t border-slate-200">
              <div className="text-[13px] font-semibold text-slate-400 uppercase tracking-[0.1em]">Откуда спасённые</div>
              <div className="mt-3 space-y-2.5">
                {[
                  { label: "ИИ-Отговорщик", value: savedBy.ai, icon: Sparkles, tone: "text-indigo-600", bar: "bg-indigo-500" },
                  { label: "Быстрые победы", value: savedBy.habit, icon: Zap, tone: "text-emerald-600", bar: "bg-emerald-500" },
                  { label: "Остаток бюджета", value: savedBy.budget, icon: Heart, tone: "text-amber-600", bar: "bg-amber-400" },
                ].map((s) => (
                  <div key={s.label} className="flex items-center gap-3">
                    <s.icon size={15} className={`${s.tone} shrink-0`} />
                    <span className="text-[15px] text-slate-600 w-32 shrink-0">{s.label}</span>
                    <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className={`h-full ${s.bar} rounded-full transition-all duration-700`} style={{ width: `${(s.value / maxSrc) * 100}%` }} />
                    </div>
                    <span className="text-[13px] font-semibold text-slate-700 tabnum w-16 text-right">{fmt(s.value)}</span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </section>

      <section className={`${card} p-5`}>
        <h2 className="text-[15px] font-bold text-slate-900">Вклад каждого</h2>
        <p className="text-[13px] text-slate-500 mt-0.5">Кто сколько закинул в копилку</p>
        <div className="mt-4 h-3 rounded-full overflow-hidden flex bg-slate-100">
          {both > 0 && partners.map((p) => <div key={p.id} className={`${barOf(p, partners)} transition-all duration-700`} style={{ width: `${((deposits[p.id] || 0) / both) * 100}%` }} />)}
        </div>
        <div className="mt-3 grid grid-cols-2 gap-3">
          {partners.map((p) => (
            <div key={p.id} className="flex items-center gap-2.5 min-w-0">
              <Avatar partner={p} size="w-9 h-9 text-[15px]" />
              <div className="min-w-0">
                <div className="text-[15px] font-semibold text-slate-900 truncate">{p.name}</div>
                <div className="text-[13px] text-slate-500 tabnum">{fmt(deposits[p.id] || 0)}{both > 0 ? ` · ${Math.round(((deposits[p.id] || 0) / both) * 100)}%` : ""}</div>
              </div>
            </div>
          ))}
        </div>
        <p className="mt-3 text-[15px] text-slate-600">
          {both === 0
            ? "Первое пополнение — через кнопку «+» вверху."
            : Math.abs((deposits[partners[0].id] || 0) / both - 0.5) <= 0.05
            ? "Идёте ноздря в ноздрю. Идеальная команда 💚"
            : `${(deposits[partners[0].id] || 0) > (deposits[partners[1].id] || 0) ? partners[0].name : partners[1].name} ведёт этот раунд, но копилка у вас одна 💚`}
        </p>
      </section>
    </div>
  );
}

/* ═══════════════════════════ История ═══════════════════════════ */

function HistoryTab({ config, log }) {
  const [filter, setFilter] = useState("all");
  const items = filter === "all" ? log : log.filter((e) => e.type === filter);
  const partnerName = (id) => config.partners.find((p) => p.id === id)?.name || "Вместе";

  return (
    <div className="space-y-4">
      <Segmented
        value={filter}
        onChange={setFilter}
        options={[
          { id: "all", label: "Всё" },
          { id: "deposit", label: "Копилка" },
          { id: "saved", label: "Спасено" },
          { id: "expense", label: "Расходы" },
        ]}
      />
      <section className={`${card} divide-y divide-slate-200`}>
        {items.length === 0 && <div className="p-8 text-center text-[15px] text-slate-400">Здесь появятся ваши пополнения, спасённые деньги и траты</div>}
        {items.map((e) => {
          const isExp = e.type === "expense";
          const Icon = e.type === "deposit" ? Wallet : e.type === "saved" ? (e.kind === "ai" ? Sparkles : PiggyBank) : ShoppingBag;
          const tone =
            e.type === "deposit" ? "bg-emerald-50 text-emerald-600"
            : e.type === "saved" ? (e.kind === "ai" ? "bg-indigo-50 text-indigo-600" : "bg-emerald-50 text-emerald-600")
            : e.impulse ? "bg-rose-50 text-rose-500" : "bg-amber-50 text-amber-600";
          const sub =
            e.type === "deposit" ? `${partnerName(e.who)} · в копилку`
            : e.type === "saved" ? (e.who ? `Спасено · ${partnerName(e.who)}` : "Спасённые деньги")
            : `${e.impulse ? "Импульсивная покупка" : "Расход"} · ${partnerName(e.who)}`;
          return (
            <div key={e.id} className="flex items-center gap-3 px-4 py-3.5">
              <div className={`w-10 h-10 rounded-2xl ${tone} flex items-center justify-center shrink-0`}><Icon size={18} /></div>
              <div className="flex-1 min-w-0">
                <div className="text-[15px] font-medium text-slate-900 truncate">{e.title}</div>
                <div className="text-[13px] text-slate-500 truncate">{sub} · {whenLabel(e.ts)}</div>
              </div>
              <div className={`text-[15px] font-semibold tabnum flex items-center gap-0.5 shrink-0 ${isExp ? "text-rose-500" : "text-emerald-600"}`}>
                {isExp ? <ArrowUpRight size={14} /> : <ArrowDownLeft size={14} />}
                {isExp ? "−" : "+"}{fmt(e.amount)}
              </div>
            </div>
          );
        })}
      </section>
    </div>
  );
}

/* ═══════════════════════════ Настройки ═══════════════════════════ */

function SettingsTab({ config, meId, sharing, onSave, onReset }) {
  const [draft, setDraft] = useState(() => clone(config));
  const [confirmReset, setConfirmReset] = useState(false);
  const patch = (p) => setDraft((x) => ({ ...x, ...p }));
  const ok = valid.partners(draft.partners) && valid.basics(draft.goal) && valid.stages(draft.goal) && valid.habits(draft.habits) && valid.budget(draft.budget);
  const dirty = JSON.stringify(draft) !== JSON.stringify(config);

  const Section = ({ title, children }) => (
    <section className="space-y-3">
      <h2 className="text-[13px] font-semibold text-slate-400 uppercase tracking-[0.1em] px-1">{title}</h2>
      {children}
    </section>
  );

  return (
    <div className="space-y-7">
      {sharing}
      {Section({ title: "Пара", children: <PartnersEditor partners={draft.partners} meId={meId} onChange={(partners) => patch({ partners })} /> })}
      {Section({ title: "Цель", children: <div className={`${card} p-4`}><GoalBasicsEditor goal={draft.goal} onChange={(goal) => patch({ goal })} /></div> })}
      {Section({ title: "Этапы", children: <StagesEditor goal={draft.goal} onChange={(goal) => patch({ goal })} /> })}
      {Section({ title: "Ваши статьи трат", children: <HabitsEditor habits={draft.habits} onChange={(habits) => patch({ habits })} /> })}
      {Section({ title: "Дневной бюджет", children: <BudgetEditor budget={draft.budget} onChange={(budget) => patch({ budget })} /> })}
      {Section({ title: "Характер ИИ по умолчанию", children: <PersonaEditor persona={draft.persona} onChange={(persona) => patch({ persona })} /> })}

      <section className={`${card} p-4`}>
        {!confirmReset ? (
          <button onClick={() => setConfirmReset(true)} className="w-full flex items-center justify-center gap-2 text-[15px] text-rose-500 font-medium py-2 transition-all active:scale-95">
            <RotateCcw size={16} /> Начать заново
          </button>
        ) : (
          <div className="space-y-3 anim-rise">
            <p className="text-[15px] text-slate-700 text-center">Удалить цель, историю и настройки у вас обоих? Это нельзя отменить.</p>
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => setConfirmReset(false)} className="py-2.5 rounded-2xl bg-slate-100 text-slate-700 text-[15px] font-medium transition-all active:scale-95">Отмена</button>
              <button onClick={onReset} className="py-2.5 rounded-2xl bg-rose-500 text-white text-[15px] font-semibold transition-all active:scale-95">Удалить всё</button>
            </div>
          </div>
        )}
      </section>

      {dirty && (
        <div className="fixed inset-x-0 z-30 px-4" style={{ bottom: "calc(84px + env(safe-area-inset-bottom, 0px))" }}>
          <div className="max-w-md mx-auto anim-rise">
            <button
              onClick={() => onSave(draft)}
              disabled={!ok}
              className="w-full bg-slate-900 text-white text-base font-semibold rounded-2xl py-3.5 shadow-soft transition-all active:scale-95 disabled:bg-slate-300"
            >
              {ok ? "Сохранить изменения" : "Заполните все поля"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════ Модалка ИИ ═══════════════════════════ */

function AiSheet({ config, total, defaultWho, onClose, onSave, onBuy }) {
  const [item, setItem] = useState("");
  const [price, setPrice] = useState(0);
  const [who, setWho] = useState(defaultWho);
  const [persona, setPersona] = useState(config.persona);
  const [phase, setPhase] = useState("idle");
  const [answer, setAnswer] = useState("");
  const [shown, setShown] = useState(0);
  const timer = useRef();

  useEffect(() => () => clearTimeout(timer.current), []);
  useEffect(() => {
    if (phase !== "answer" || shown >= answer.length) return;
    const id = setTimeout(() => setShown((s) => Math.min(answer.length, s + 3)), 16);
    return () => clearTimeout(id);
  }, [phase, shown, answer]);

  const run = (pid = persona) => {
    if (price <= 0) return;
    haptic("medium");
    clearTimeout(timer.current);
    setPhase("thinking");
    setShown(0);
    timer.current = setTimeout(() => {
      setAnswer(buildVerdict({ item, price, persona: pid, config, total }));
      setPhase("answer");
    }, 950);
  };
  const switchPersona = (id) => { setPersona(id); if (phase !== "idle") run(id); };
  const touch = () => { if (phase !== "idle") { clearTimeout(timer.current); setPhase("idle"); } };

  const typing = phase === "answer" && shown < answer.length;
  const current = PERSONAS.find((x) => x.id === persona);
  const name = item.trim() || "Покупка";

  return (
    <Sheet title="Огонёк · ИИ" subtitle="Хочу купить импульсивную дичь" lead={<AiAvatar size="w-10 h-10" />} onClose={onClose}>
      <div className="space-y-4 pb-2">
        <div>
          <Label>Кто хочет купить</Label>
          <div className="grid grid-cols-2 gap-2">
            {config.partners.map((p) => (
              <button key={p.id} onClick={() => setWho(p.id)} className={`flex items-center gap-2 p-2 rounded-2xl border-2 transition-all active:scale-95 ${who === p.id ? "border-indigo-300 bg-indigo-50/50" : "border-slate-200"}`}>
                <Avatar partner={p} size="w-8 h-8 text-[13px]" />
                <span className="text-[15px] font-medium text-slate-800 truncate">{p.name}</span>
              </button>
            ))}
          </div>
        </div>

        {config.habits.length > 0 && (
          <div className="flex gap-2 overflow-x-auto -mx-5 px-5 pb-1 no-scrollbar">
            {config.habits.map((h) => (
              <button
                key={h.id}
                onClick={() => { setItem(h.label); setPrice(h.amount); touch(); }}
                className={`shrink-0 text-[13px] px-3 py-1.5 rounded-full border transition-all active:scale-95 ${item === h.label ? "border-indigo-300 bg-indigo-50 text-indigo-700" : "border-slate-200 text-slate-600"}`}
              >
                {h.emoji} {h.label}
              </button>
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 min-[380px]:grid-cols-[1fr_9.5rem] gap-2">
          <div>
            <Label>Что хочешь купить?</Label>
            <input id="ai-item" value={item} maxLength={40} onChange={(e) => { setItem(e.target.value); touch(); }} placeholder="Кроссовки" className={`${inputCls} focus:border-ink focus:ring-honey-soft`} />
          </div>
          <div>
            <Label>Цена</Label>
            <MoneyInput id="ai-price" value={price} onChange={(v) => { setPrice(v); touch(); }} placeholder="4 500" maxDigits={7} />
          </div>
        </div>

        <div>
          <Label>Характер ИИ</Label>
          <div className="grid grid-cols-3 gap-1 bg-slate-100 p-1 rounded-2xl">
            {PERSONAS.map((x) => (
              <button key={x.id} onClick={() => switchPersona(x.id)} className={`rounded-xl py-2 px-1 transition-all active:scale-95 ${persona === x.id ? "bg-white shadow-soft text-indigo-700" : "text-slate-500"}`}>
                <div className="text-lg leading-none">{x.emoji}</div>
                <div className="text-[13px] font-semibold mt-1 leading-tight">{x.name}</div>
              </button>
            ))}
          </div>
        </div>

        {phase === "idle" && (
          <button onClick={() => run()} disabled={price <= 0} className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white text-base font-semibold rounded-2xl py-3.5 transition-all active:scale-95 hover:bg-indigo-700 disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none">
            <Sparkles size={18} /> Отговори меня
          </button>
        )}

        {phase !== "idle" && (
          <div className="bg-white border border-slate-200 rounded-[20px] p-4 anim-rise" aria-live="polite">
            <div className="flex items-center gap-2 min-w-0">
              <AiAvatar size="w-8 h-8" />
              <div className="text-[15px] font-semibold text-slate-900 shrink-0">Огонёк · ИИ</div>
              <span className="text-[13px] text-slate-500 bg-sand px-2 py-0.5 rounded-full truncate">{current.emoji} {current.name}</span>
            </div>
            {phase === "thinking" ? (
              <div className="mt-3 flex items-center gap-1.5 text-[15px]">
                <span className="dot" /><span className="dot" style={{ animationDelay: ".15s" }} /><span className="dot" style={{ animationDelay: ".3s" }} />
                <span className="ml-1 text-slate-500">сверяется с вашими этапами…</span>
              </div>
            ) : (
              <p onClick={() => setShown(answer.length)} className={`mt-3 leading-relaxed text-slate-800 whitespace-pre-line ${persona === "buh" ? "font-mono text-[13px]" : "text-[15px]"}`}>
                {answer.slice(0, shown)}
                {typing && <span className="caret" />}
              </p>
            )}
          </div>
        )}

        {phase === "answer" && !typing && (
          <div className="space-y-2 anim-rise">
            <button onClick={() => onSave(price, name)} className="w-full bg-emerald-500 text-white text-base font-semibold rounded-2xl py-3.5 px-4 transition-all active:scale-95 hover:bg-emerald-600">
              Ладно, не покупаю! <span className="opacity-90 tabnum">(+{fmt(price)} в спасённые)</span>
            </button>
            <button onClick={() => onBuy(price, name, who)} className="w-full bg-white border border-rose-200 text-rose-500 font-medium rounded-2xl py-3 transition-all active:scale-95 hover:bg-rose-50">
              Всё равно куплю (слабак)
            </button>
            <button onClick={() => run()} className="w-full text-[13px] text-indigo-500 py-1.5 transition-all active:scale-95">Спросить ещё раз</button>
          </div>
        )}
      </div>
    </Sheet>
  );
}

/* ═══════════════════════════ Модалка пополнения / расхода ═══════════════════════════ */

function AddSheet({ config, deposits, defaultWho, initialMode = "in", onClose, onDeposit, onExpense }) {
  const [mode, setMode] = useState(initialMode);
  const [who, setWho] = useState(defaultWho);
  const [amount, setAmount] = useState(0);
  const [note, setNote] = useState("");
  const presets = mode === "in" ? [1000, 3000, 5000, 10000] : [300, 700, 1500, 3000];
  const both = config.partners.reduce((s, p) => s + (deposits[p.id] || 0), 0);
  const partner = config.partners.find((p) => p.id === who);

  const submit = (e) => {
    e.preventDefault();
    if (amount <= 0) return;
    mode === "in" ? onDeposit(who, amount, note.trim()) : onExpense(who, amount, note.trim());
  };

  return (
    <Sheet
      title={mode === "in" ? "Закинуть в копилку" : "Записать трату"}
      subtitle={mode === "in" ? `Каждый рубль приближает цель «${config.goal.title}»` : "Без осуждения, просто учёт"}
      icon={mode === "in" ? PiggyBank : ShoppingBag}
      iconTone={mode === "in" ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"}
      onClose={onClose}
    >
      <form onSubmit={submit} className="space-y-4 pb-2">
        <Segmented value={mode} onChange={(m) => { setMode(m); setAmount(0); }} options={[{ id: "in", label: "В копилку" }, { id: "out", label: "Расход" }]} />
        <div>
          <Label>{mode === "in" ? "От кого" : "Кто потратил"}</Label>
          <div className="grid grid-cols-2 gap-2">
            {config.partners.map((p) => (
              <button
                type="button"
                key={p.id}
                onClick={() => setWho(p.id)}
                className={`flex items-center gap-2.5 p-3 rounded-2xl border-2 transition-all active:scale-95 text-left ${who === p.id ? (mode === "in" ? "border-emerald-400 bg-emerald-50/50" : "border-amber-400 bg-amber-50/50") : "border-slate-200 bg-white"}`}
              >
                <Avatar partner={p} size="w-9 h-9 text-[15px]" />
                <div className="min-w-0">
                  <div className="text-[15px] font-semibold text-slate-900 truncate">{p.name}</div>
                  <div className="text-[13px] text-slate-500 tabnum">{both > 0 ? `вклад ${Math.round(((deposits[p.id] || 0) / both) * 100)}%` : "пока 0 ₽"}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
        <div>
          <Label>Сумма</Label>
          <MoneyInput id="add-amount" value={amount} onChange={setAmount} big />
        </div>
        <div className="flex gap-2 flex-wrap">
          {presets.map((v) => (
            <button type="button" key={v} onClick={() => setAmount(v)} className={`px-3 py-1.5 rounded-full text-[15px] tabnum border transition-all active:scale-95 ${amount === v ? "border-slate-900 bg-slate-900 text-white" : "border-slate-200 text-slate-600"}`}>
              {v.toLocaleString("ru-RU")} ₽
            </button>
          ))}
        </div>
        <div>
          <Label>Комментарий</Label>
          <input id="add-note" value={note} maxLength={40} onChange={(e) => setNote(e.target.value)} placeholder={mode === "in" ? "Например: кэшбэк, подработка" : "Например: продукты"} className={inputCls} />
        </div>
        <button type="submit" disabled={amount <= 0} className={`w-full text-white text-base font-semibold rounded-2xl py-3.5 transition-all active:scale-95 disabled:bg-slate-200 disabled:text-slate-400 ${mode === "in" ? "bg-emerald-500 hover:bg-emerald-600" : "bg-amber-500 hover:bg-ink-hover"}`}>
          {mode === "in" ? `Закинуть ${fmt(amount)} · ${partner.name}` : `Записать трату ${fmt(amount)}`}
        </button>
      </form>
    </Sheet>
  );
}

/* ═══════════════════════════ Приложение ═══════════════════════════ */

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Onest:wght@400;500;600;700;800&display=swap');
html, body { background: #FFF8EE; color: #294734; }
.tma-root { font-family: 'Onest', ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif; -webkit-tap-highlight-color: transparent; }
.tabnum { font-variant-numeric: tabular-nums; }
.no-scrollbar::-webkit-scrollbar { display: none; } .no-scrollbar { scrollbar-width: none; }
input[type="date"] { min-height: 48px; -webkit-appearance: none; }
@keyframes sheetUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
@keyframes toastIn { from { transform: translateY(-140%); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
@keyframes fly { 0% { transform: translate(-50%, 20px) scale(.7); opacity: 0; } 15% { transform: translate(-50%, 0) scale(1.15); opacity: 1; } 70% { opacity: 1; } 100% { transform: translate(-50%, -48vh) scale(.55); opacity: 0; } }
@keyframes pop { 0% { transform: scale(1); } 40% { transform: scale(1.01); box-shadow: 0 0 0 5px rgb(168 185 154 / .35); } 100% { transform: scale(1); } }
@keyframes rise { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
@keyframes blink { 50% { opacity: 0; } }
@keyframes bounceDot { 0%, 80%, 100% { opacity: .35; } 40% { opacity: 1; } }
.anim-sheet { animation: sheetUp .22s cubic-bezier(.2,.9,.3,1); }
.anim-fade { animation: fadeIn .18s ease-out; }
.anim-toast { animation: toastIn .22s cubic-bezier(.2,.9,.3,1); }
.anim-fly { animation: fly 1.1s cubic-bezier(.3,.7,.4,1) forwards; }
.anim-pop { animation: pop .6s ease-out; }
.anim-rise { animation: rise .2s ease-out both; }
.caret { display: inline-block; width: 2px; height: 1em; background: #294734; margin-left: 2px; vertical-align: -2px; animation: blink .8s steps(1) infinite; }
.dot { width: 6px; height: 6px; border-radius: 999px; background: #8A6420; display: inline-block; animation: bounceDot 1.4s infinite; }
button:focus-visible, input:focus-visible { outline: 2px solid #294734; outline-offset: 2px; }
.tma-root button { transition-duration: 120ms; }
.tma-root { font-size: 16px; font-variant-ligatures: none; }
@media (prefers-reduced-motion: reduce) { *, *::before, *::after { animation-duration: .01ms !important; animation-iteration-count: 1 !important; transition-duration: .01ms !important; } }
`;

const TOAST_TONES = {
  emerald: "bg-emerald-50 text-emerald-600",
  rose: "bg-rose-50 text-rose-500",
  amber: "bg-amber-50 text-amber-600",
  indigo: "bg-indigo-50 text-indigo-600",
};

/* ═══════════════════════════ Общее хранилище на двоих ═══════════════════════════
   Внутри Claude данные живут в общей базе артефакта и приходят на все устройства
   в реальном времени. Вне Claude приложение работает локально (localStorage).

   couple/config     — настройки пары (имена, цель, этапы, привычки, бюджет)
   couple/challenge  — челлендж недели
   log/<id>          — каждое пополнение, спасение и трата отдельным документом
   members/<userId>  — кто из партнёров открыл приложение с этого аккаунта      */

const LOCAL_KEY = "kopilka-dvoih-v3";
const EMPTY = { config: null, challenge: null, log: [], members: {} };
const plain = (x) => JSON.parse(JSON.stringify(x));
const loadLocal = () => { try { const r = localStorage.getItem(LOCAL_KEY); return r ? JSON.parse(r) : null; } catch (e) { return null; } };
const saveLocal = (s) => { try { s ? localStorage.setItem(LOCAL_KEY, JSON.stringify(s)) : localStorage.removeItem(LOCAL_KEY); } catch (e) { /* нет хранилища */ } };

function useCoupleStore(onWriteError) {
  const [mode, setMode] = useState("loading"); // loading | cloud | local | error
  const [data, setData] = useState(EMPTY);
  const [meId, setMeId] = useState(null);
  const [readOnly, setReadOnly] = useState(false);
  const [online, setOnline] = useState([]);
  const [incoming, setIncoming] = useState(null);
  const [roomOn, setRoomOn] = useState(false);
  const db = useRef(null);
  const room = useRef(null);
  const errCb = useRef(onWriteError);
  errCb.current = onWriteError;

  const goLocal = () => {
    const s = loadLocal();
    setData(s ? { ...EMPTY, ...s, members: {} } : EMPTY);
    setMode("local");
  };

  useEffect(() => {
    let alive = true;
    const unsubs = [];
    const mountedAt = Date.now();
    const timeout = setTimeout(() => { if (alive) setMode((m) => (m === "loading" ? "error" : m)); }, 15000);

    (async () => {
      const api = typeof window !== "undefined" && window.claude && typeof window.claude.use === "function" ? window.claude : null;
      let d = null;
      try { d = api ? await api.use("db") : null; } catch (e) { d = null; }
      if (!alive) return;
      if (!d) { clearTimeout(timeout); goLocal(); return; }
      db.current = d;

      let u = null;
      try { u = await api.use("user"); } catch (e) { u = null; }
      const id = u ? await u.id() : null;
      if (!alive) return;
      setMeId(id);
      if (u) u.can("data.write").then((v) => { if (alive && v === false) setReadOnly(true); });

      const got = {};
      const ready = (k) => {
        got[k] = true;
        if (got.config && got.log) { clearTimeout(timeout); setMode((m) => (m === "loading" ? "cloud" : m)); }
      };
      const onErr = (k) => (e) => { console.warn("Копилка: подписка", k, e && e.code); ready(k); };

      try {
        unsubs.push(d.doc("couple/config").onSnapshot((s) => { setData((x) => ({ ...x, config: s.exists ? s.data() : null })); ready("config"); }, onErr("config")));
        unsubs.push(d.doc("couple/challenge").onSnapshot((s) => setData((x) => ({ ...x, challenge: s.exists ? s.data() : null })), onErr("challenge")));
        unsubs.push(d.collection("log").orderBy("ts", "desc").onSnapshot((q) => {
          const log = q.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
          const fresh = q.docChanges()
            .filter((c) => c.type === "added")
            .map((c) => ({ ...c.doc.data(), id: c.doc.id }))
            .filter((e) => e.ts > mountedAt && e.by && e.by !== id);
          if (fresh.length) setIncoming({ entries: fresh, key: Date.now() + Math.random() });
          setData((x) => ({ ...x, log }));
          ready("log");
        }, onErr("log")));
        unsubs.push(d.collection("members").onSnapshot((q) => {
          const members = {};
          q.docs.forEach((doc) => { const v = doc.data(); if (v && typeof v.partnerId === "string") members[doc.id] = v.partnerId; });
          setData((x) => ({ ...x, members }));
        }, onErr("members")));
      } catch (e) {
        console.warn("Копилка: база недоступна", e);
        clearTimeout(timeout);
        if (alive) setMode("error");
        return;
      }

      try {
        const r = await api.use("room");
        if (r && alive) {
          room.current = r;
          setRoomOn(true);
          unsubs.push(r.onPeers((ch) => {
            const ids = ch.peers
              .filter((p) => !p.isMe && p.kind === "viewer")
              .map((p) => p.presence && p.presence.partnerId)
              .filter((v) => typeof v === "string");
            setOnline([...new Set(ids)]);
          }, () => {}));
        }
      } catch (e) { /* без присутствия — не страшно */ }
    })();

    return () => { alive = false; clearTimeout(timeout); unsubs.forEach((u) => { try { u(); } catch (e) { /* уже отписаны */ } }); };
  }, []);

  useEffect(() => {
    if (mode === "local") saveLocal(data.config ? { config: data.config, challenge: data.challenge, log: data.log } : null);
  }, [data, mode]);

  const linked = meId && data.members[meId];
  const myPartnerId =
    mode === "local" ? data.config?.partners[0]?.id || null
    : data.config && linked && data.config.partners.some((p) => p.id === linked) ? linked : null;

  useEffect(() => {
    if (roomOn && room.current && myPartnerId) room.current.presence({ partnerId: myPartnerId }).catch(() => {});
  }, [roomOn, myPartnerId]);

  const cloud = mode === "cloud";
  const run = async (fn) => {
    try { await fn(); return true; }
    catch (e) {
      if (e && e.code === "invalid_argument") setReadOnly(true);
      if (errCb.current) errCb.current(e);
      return false;
    }
  };
  const ok = Promise.resolve(true);

  const actions = {
    setup: (s) => {
      if (!cloud) { setData({ ...EMPTY, ...s }); return ok; }
      return run(async () => {
        const d = db.current;
        for (const e of s.log) { const { id, ...rest } = e; await d.collection("log").doc(id).set(plain({ ...rest, by: meId })); }
        if (meId) await d.collection("members").doc(meId).set({ partnerId: s.config.partners[0].id });
        if (s.challenge) await d.doc("couple/challenge").set(plain(s.challenge));
        await d.doc("couple/config").set(plain(s.config)); // последним — чтобы партнёр увидел всё сразу
      });
    },
    addLog: (entry) => {
      const e = { id: uid(), ts: Date.now(), by: meId, ...entry };
      if (!cloud) { setData((x) => ({ ...x, log: [e, ...x.log] })); return ok; }
      const { id, ...rest } = e;
      return run(() => db.current.collection("log").doc(id).set(plain(rest)));
    },
    saveConfig: (cfg) => {
      if (!cloud) { setData((x) => ({ ...x, config: cfg })); return ok; }
      return run(() => db.current.doc("couple/config").set(plain(cfg)));
    },
    setChallenge: (ch) => {
      if (!cloud) { setData((x) => ({ ...x, challenge: ch })); return ok; }
      return run(() => (ch ? db.current.doc("couple/challenge").set(plain(ch)) : db.current.doc("couple/challenge").delete()));
    },
    patchChallenge: (patch) => {
      if (!cloud) {
        setData((x) => ({ ...x, challenge: { ...x.challenge, ...patch, days: { ...(x.challenge?.days || {}), ...(patch.days || {}) } } }));
        return ok;
      }
      return run(() => db.current.doc("couple/challenge").update(plain(patch))); // days сливаются по ключам — без гонок между телефонами
    },
    link: (partnerId) => {
      if (!cloud || !meId) return ok;
      return run(() => db.current.collection("members").doc(meId).set({ partnerId }));
    },
    reset: () => {
      if (!cloud) { setData(EMPTY); return ok; }
      const d = db.current;
      const logIds = data.log.map((e) => e.id);
      const memberIds = Object.keys(data.members);
      return run(async () => {
        for (const id of logIds) await d.collection("log").doc(id).delete();
        for (const id of memberIds) await d.collection("members").doc(id).delete();
        await d.doc("couple/challenge").delete();
        await d.doc("couple/config").delete();
      });
    },
  };

  actions.join = () => ok;
  return { mode, data, meId, myPartnerId, readOnly, online, incoming, actions, goLocal, invite: null, inviteLink: null };
}

/* ═══════════════════════════ Хранилище в Telegram (Serverless) ═══════════════════════════
   Внутри Telegram данные живут в базе бота (tgcloud/). Telegram сам проверяет, кто открыл
   приложение. Телефоны раз в несколько секунд спрашивают, не изменилось ли что-то.        */

const TG = typeof window !== "undefined" && window.Telegram ? window.Telegram.WebApp : null;
const IN_TG = !!(TG && TG.initData && TG.Serverless && typeof TG.Serverless.call === "function");
const tgCall = (name, input = {}) =>
  new Promise((resolve, reject) => {
    try { TG.Serverless.call("kopilka", { ...input, action: name }, (err, res) => (err ? reject(err) : resolve(res))); }
    catch (e) { reject(e); }
  });

function useTelegramStore(onWriteError) {
  const [mode, setMode] = useState("loading");
  const [data, setData] = useState(EMPTY);
  const [meId, setMeId] = useState(null);
  const [invite, setInvite] = useState(null);
  const [incoming, setIncoming] = useState(null);
  const [meta, setMeta] = useState({ code: null, bot: null });
  const version = useRef(0);
  const seen = useRef(null);
  const me = useRef(null);
  const pending = useRef(0);
  const mountedAt = useRef(Date.now());
  const errCb = useRef(onWriteError);
  errCb.current = onWriteError;

  const apply = (res) => {
    if (!res || res.unchanged) return;
    if (res.me) { me.current = res.me; setMeId(res.me); }
    if (res.bot) setMeta((m) => (m.bot === res.bot ? m : { ...m, bot: res.bot }));
    if (res.couple) {
      version.current = res.couple.version;
      const log = res.log || [];
      if (seen.current) {
        const fresh = log.filter((e) => !seen.current.has(e.id) && e.by && e.by !== me.current && e.ts > mountedAt.current);
        if (fresh.length) setIncoming({ entries: fresh, key: Date.now() + Math.random() });
      }
      seen.current = new Set(log.map((e) => e.id));
      setMeta((m) => (m.code === res.couple.id ? m : { ...m, code: res.couple.id }));
      setInvite(null);
      setData({ config: res.couple.config || null, challenge: res.couple.challenge || null, log, members: res.members || {} });
    } else {
      version.current = 0;
      seen.current = null;
      setData((d) => (d.config || d.log.length ? EMPTY : d));
      const inv = res.invite || null;
      setInvite((cur) => (JSON.stringify(cur) === JSON.stringify(inv) ? cur : inv));
    }
  };

  const refresh = async () => {
    if (pending.current > 0) return;
    try {
      const res = await tgCall("state", { since: version.current || undefined });
      if (pending.current === 0) apply(res);
    } catch (e) { /* связь моргнула — попробуем на следующем круге */ }
  };

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await tgCall("state", { code: (TG.initDataUnsafe && TG.initDataUnsafe.start_param) || undefined });
        if (!alive) return;
        apply(res);
        setMode("tg");
      } catch (e) {
        if (alive) setMode("error");
      }
    })();
    const tick = setInterval(() => { if (document.visibilityState === "visible") refresh(); }, 4000);
    const onVis = () => { if (document.visibilityState === "visible") refresh(); };
    document.addEventListener("visibilitychange", onVis);
    return () => { alive = false; clearInterval(tick); document.removeEventListener("visibilitychange", onVis); };
  }, []);

  const run = async (name, input, optimistic) => {
    pending.current += 1;
    if (optimistic) setData(optimistic);
    try {
      const res = await tgCall(name, input);
      pending.current -= 1;
      if (res && (res.couple || res.none)) apply(res);
      else await refresh();
      return true;
    } catch (e) {
      pending.current -= 1;
      if (errCb.current) errCb.current(e);
      await refresh();
      return false;
    }
  };

  const actions = {
    setup: (s) => run("setup", { config: s.config, challenge: s.challenge, log: s.log }),
    addLog: (entry) => {
      const e = { id: uid(), ts: Date.now(), by: me.current, ...entry };
      if (seen.current) seen.current.add(e.id);
      return run("addEntry", { entry: e }, (d) => ({ ...d, log: [e, ...d.log] }));
    },
    saveConfig: (cfg) => run("saveConfig", { config: cfg }, (d) => ({ ...d, config: cfg })),
    setChallenge: (ch) => run("setChallenge", { challenge: ch }, (d) => ({ ...d, challenge: ch })),
    patchChallenge: (patch) =>
      run("patchChallenge", { patch }, (d) => ({
        ...d,
        challenge: { ...d.challenge, ...patch, days: { ...(d.challenge?.days || {}), ...(patch.days || {}) } },
      })),
    join: (partnerId) => run("join", { code: invite && invite.code, partnerId }),
    link: () => Promise.resolve(true),
    reset: () => run("reset", {}),
  };

  const linked = meId && data.members[meId];
  const myPartnerId = data.config && linked && data.config.partners.some((p) => p.id === linked) ? linked : null;
  const inviteLink = meta.bot && meta.code ? `https://t.me/${meta.bot}?startapp=${meta.code}` : null;

  return { mode, data, meId, myPartnerId, readOnly: false, online: [], incoming, actions, goLocal: () => setMode("error"), invite, inviteLink };
}

const useStore = IN_TG ? useTelegramStore : useCoupleStore;

const shareInvite = (link, goalTitle) => {
  const text = `Давай копить на «${goalTitle}» вместе 🐷 Открой ссылку, и у нас будет общая копилка.`;
  const url = `https://t.me/share/url?url=${encodeURIComponent(link)}&text=${encodeURIComponent(text)}`;
  try {
    if (TG && TG.openTelegramLink) TG.openTelegramLink(url);
    else window.open(url, "_blank");
  } catch (e) { window.open(url, "_blank"); }
};

function InviteCard({ partner, link, goalTitle }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    try {
      navigator.clipboard.writeText(link).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1800); }).catch(() => {});
    } catch (e) { /* без буфера обмена */ }
  };
  return (
    <section className="rounded-3xl bg-indigo-50 border border-indigo-100 p-5">
      <div className="flex items-center gap-3">
        <Avatar partner={partner} size="w-11 h-11 text-base" />
        <div className="min-w-0">
          <h2 className="text-[15px] font-bold text-indigo-950">Позовите {partner.name}</h2>
          <p className="text-[13px] text-indigo-900/70">Откроет ссылку — и копилка станет общей</p>
        </div>
      </div>
      <div className="mt-4 grid grid-cols-[1fr_auto] gap-2">
        <button onClick={() => shareInvite(link, goalTitle)} className="bg-indigo-600 text-white font-semibold text-base rounded-2xl py-3 transition-all active:scale-95 hover:bg-indigo-700">
          Отправить приглашение
        </button>
        <button onClick={copy} className="px-4 rounded-2xl bg-white text-indigo-700 text-[15px] font-medium border border-indigo-100 transition-all active:scale-95">
          {copied ? "Скопировано" : "Ссылка"}
        </button>
      </div>
    </section>
  );
}

/* ═══════════════════════════ Экраны подключения ═══════════════════════════ */

function Splash({ title, text, children }) {
  return (
    <div className="max-w-md mx-auto min-h-screen flex flex-col items-center justify-center text-center px-6">
      <div className="w-16 h-16 rounded-3xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
        <PiggyBank size={30} />
      </div>
      <h1 className="mt-5 text-xl font-bold text-slate-900">{title}</h1>
      {text && <p className="mt-2 text-[15px] text-slate-500 leading-relaxed">{text}</p>}
      {children}
    </div>
  );
}

function JoinScreen({ config, members, onPick, onSkip, skipLabel = "Просто посмотреть" }) {
  const taken = new Set(Object.values(members));
  const target = goalTotal(config.goal);
  return (
    <div className="max-w-md mx-auto min-h-screen flex flex-col px-5 pt-14 pb-8">
      <div className="flex -space-x-3">
        {config.partners.map((p) => <Avatar key={p.id} partner={p} size="w-14 h-14 text-xl" />)}
      </div>
      <h1 className="mt-6 text-[28px] leading-[1.15] font-extrabold tracking-tight text-slate-900">
        Вас позвали в копилку «{config.goal.title}»
      </h1>
      <p className="mt-3 text-[15px] text-slate-600 leading-relaxed">
        {config.partners.map((p) => p.name).join(" и ")} копят {fmt(target)} к {dateLong(config.goal.date)}. Кто из них вы?
      </p>
      <div className="mt-6 space-y-2">
        {config.partners.map((p) => {
          const busy = taken.has(p.id);
          return (
            <button
              key={p.id}
              disabled={busy}
              onClick={() => onPick(p.id)}
              className="w-full flex items-center gap-3 p-4 rounded-2xl bg-white border-2 border-slate-200 text-left transition-all active:scale-[0.98] hover:border-emerald-300 disabled:opacity-50 disabled:hover:border-slate-200"
            >
              <Avatar partner={p} size="w-11 h-11 text-base" />
              <div className="flex-1 min-w-0">
                <div className="text-[15px] font-semibold text-slate-900">{p.name}</div>
                <div className="text-[13px] text-slate-500">{busy ? "Уже в копилке" : "Это я"}</div>
              </div>
              {!busy && <ChevronRight size={18} className="text-slate-300" />}
            </button>
          );
        })}
      </div>
      <div className="flex-1" />
      <button onClick={onSkip} className="text-[15px] text-slate-500 py-3 transition-all active:scale-95">{skipLabel}</button>
    </div>
  );
}

function SharingCard({ mode, config, members, myPartnerId, online, onLink, inviteLink }) {
  const linkedIds = new Set(Object.values(members));
  if (mode !== "cloud" && mode !== "tg") {
    return (
      <section className="rounded-3xl bg-amber-50 border border-amber-100 p-5">
        <h2 className="text-[15px] font-bold text-amber-900">Пока только на этом устройстве</h2>
        <p className="mt-1 text-[15px] text-amber-900/80 leading-relaxed">
          Общая копилка работает, когда приложение открыто в Claude. Здесь данные хранятся только в этом браузере.
        </p>
      </section>
    );
  }
  return (
    <section className={`${card} p-5`}>
      <div className="flex items-center gap-2">
        <span className="relative flex w-2.5 h-2.5">
          <span className="relative w-2.5 h-2.5 rounded-full bg-emerald-500" />
        </span>
        <h2 className="text-[15px] font-bold text-slate-900">Копилка общая</h2>
      </div>
      <p className="mt-1 text-[15px] text-slate-500">Всё, что делает один, сразу видно у второго, на любом устройстве.</p>
      <div className="mt-4 space-y-2">
        {config.partners.map((p) => {
          const me = p.id === myPartnerId;
          const here = online.includes(p.id);
          const joined = linkedIds.has(p.id);
          return (
            <div key={p.id} className="flex items-center gap-3">
              <Avatar partner={p} size="w-9 h-9 text-[15px]" />
              <div className="flex-1 min-w-0">
                <div className="text-[15px] font-semibold text-slate-900 truncate">{p.name}{me ? " · вы" : ""}</div>
                <div className={`text-[13px] ${here ? "text-emerald-600" : "text-slate-500"}`}>
                  {me ? "Это устройство" : here ? "Сейчас в приложении" : joined ? "Подключен(а)" : "Ещё не открывал(а)"}
                </div>
              </div>
              {!me && !joined && mode === "cloud" && (
                <button onClick={() => onLink(p.id)} className="text-[13px] px-3 py-1.5 rounded-full border border-slate-200 text-slate-600 transition-all active:scale-95">
                  Это я
                </button>
              )}
            </div>
          );
        })}
      </div>
      {mode === "tg" ? (
        inviteLink && config.partners.some((p) => !linkedIds.has(p.id)) && (
          <button onClick={() => shareInvite(inviteLink, config.goal.title)} className="mt-4 w-full bg-indigo-600 text-white font-semibold text-base rounded-2xl py-3 transition-all active:scale-95">
            Отправить приглашение
          </button>
        )
      ) : (
        <div className="mt-4 rounded-2xl bg-slate-50 p-3.5 text-[15px] text-slate-600 leading-relaxed">
          <div className="font-semibold text-slate-800 mb-1">Как пригласить</div>
          Нажмите «Поделиться» в Claude над этой страницей и пригласите партнёра по email с правом «Редактор». Публичную ссылку не включайте: по ней можно только смотреть.
        </div>
      )}
    </section>
  );
}

/* ═══════════════════════════ Приложение ═══════════════════════════ */

export default function App() {
  const [tab, setTab] = useState("home");
  const [sheet, setSheet] = useState(null);
  const [toast, setToast] = useState(null);
  const [flyer, setFlyer] = useState(null);
  const [pulse, setPulse] = useState(0);
  const [settingsKey, setSettingsKey] = useState(0);
  const [skipJoin, setSkipJoin] = useState(false);
  const [rewardDraft, setRewardDraft] = useState(null);
  const rewardTimer = useRef(null);

  const store = useStore((e) =>
    setToast({
      key: Date.now(),
      tone: "rose",
      icon: X,
      title: "Не сохранилось — попробуйте ещё раз",
      text:
        e && e.code === "invalid_argument" ? "Нужен доступ «Редактор» к копилке"
        : e && e.type === "UNAUTHORIZED" ? "Закройте и откройте приложение заново"
        : "Проверьте связь и попробуйте ещё раз",
    })
  );
  const { mode, data, myPartnerId, readOnly, online, actions } = store;
  const { config, log, challenge, members } = data;

  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(null), 2800);
    return () => clearTimeout(id);
  }, [toast]);

  const deposits = {};
  (config?.partners || []).forEach((p) => { deposits[p.id] = sum(log.filter((e) => e.type === "deposit" && e.who === p.id)); });
  const saved = sum(log.filter((e) => e.type === "saved"));
  const total = Object.values(deposits).reduce((a, b) => a + b, 0) + saved;
  const spentToday = sum(log.filter((e) => e.type === "expense" && isToday(e.ts)));
  const banked = sum(log.filter((e) => e.type === "saved" && e.kind === "budget" && isToday(e.ts)));
  const budgetLeft = config?.budget.enabled ? config.budget.amount - spentToday - banked : 0;
  const shared = mode === "cloud" || mode === "tg";
  const ready = shared || mode === "local";
  const defaultWho = myPartnerId || config?.partners[0]?.id;
  const partnerById = (id) => config?.partners.find((p) => p.id === id);

  // Этапы: празднуем у обоих, но не при первой загрузке
  const prevTotal = useRef(null);
  useEffect(() => {
    if (!ready || !config) { prevTotal.current = null; return; }
    if (prevTotal.current === null) { prevTotal.current = total; return; }
    let acc = 0;
    for (const s of config.goal.stages) {
      acc += s.amount;
      if (prevTotal.current < acc && total >= acc) {
        setToast({ key: Date.now(), tone: "emerald", icon: Trophy, title: `Этап «${s.title}» закрыт!`, text: `Ещё шаг к цели «${config.goal.title}»` });
        haptic("heavy");
      }
    }
    prevTotal.current = total;
  }, [total, ready, !!config]);

  // Новая неделя — челлендж с чистого листа (один раз за загрузку)
  const weekChecked = useRef(false);
  useEffect(() => {
    if (!ready || !challenge || readOnly || weekChecked.current) return;
    weekChecked.current = true;
    if (challenge.week !== weekKey()) actions.setChallenge({ ...challenge, days: {}, week: weekKey() });
  }, [ready, challenge, readOnly]);

  // Что сделал партнёр — показываем сразу
  useEffect(() => {
    if (!store.incoming || !config) return;
    const e = store.incoming.entries[0];
    const p = partnerById(e.who) || partnerById(members[e.by]);
    const name = p?.name || "Партнёр";
    if (e.type === "deposit") {
      setToast({ key: Date.now(), tone: "emerald", icon: Wallet, title: `${name}: +${fmt(e.amount)} в копилку`, text: e.title });
      setFlyer({ amount: e.amount, key: Date.now() });
      setPulse((x) => x + 1);
    } else if (e.type === "saved") {
      setToast({ key: Date.now(), tone: "emerald", icon: PiggyBank, title: `${name}: +${fmt(e.amount)} в спасённые`, text: e.title });
      setFlyer({ amount: e.amount, key: Date.now() });
      setPulse((x) => x + 1);
    } else {
      setToast({ key: Date.now(), tone: e.impulse ? "rose" : "amber", icon: ShoppingBag, title: `${name}: трата ${fmt(e.amount)}`, text: e.title });
    }
    haptic("light");
  }, [store.incoming]);

  // Telegram: светлая тема, на весь экран, без случайного закрытия свайпом
  useEffect(() => {
    if (!TG) return;
    try {
      TG.ready();
      TG.expand();
      if (TG.setHeaderColor) TG.setHeaderColor("#FFF8EE");
      if (TG.setBackgroundColor) TG.setBackgroundColor("#FFF8EE");
      if (TG.setBottomBarColor) TG.setBottomBarColor("#FFFCF7");
      if (TG.disableVerticalSwipes) TG.disableVerticalSwipes();
    } catch (e) { /* старый клиент Telegram */ }
  }, []);

  const wrap = (children) => (
    <div className="tma-root bg-slate-50 min-h-screen text-slate-900">
      <style>{CSS}</style>
      {children}
    </div>
  );

  if (mode === "loading") return wrap(<Splash title="Открываем вашу копилку…" text="Подтягиваем общие данные" />);
  if (mode === "error")
    return wrap(
      <Splash title="Не получилось подключиться" text="Общие данные сейчас недоступны. Обновите страницу или поработайте без синхронизации.">
        <button onClick={store.goLocal} className="mt-6 px-5 py-3 rounded-2xl bg-slate-900 text-white text-base font-semibold transition-all active:scale-95">
          Только на этом устройстве
        </button>
      </Splash>
    );

  if (!config && store.invite && !skipJoin) {
    const taken = {};
    store.invite.taken.forEach((pid, i) => { taken["t" + i] = pid; });
    return wrap(
      <JoinScreen config={store.invite.config} members={taken} onPick={(id) => actions.join(id)} onSkip={() => setSkipJoin(true)} skipLabel="Завести свою копилку" />
    );
  }

  if (!config) {
    if (readOnly)
      return wrap(<Splash title="Копилку ещё не настроили" text="Настройку делает тот, кто пригласил вас. Как только он(а) закончит, всё появится здесь само." />);
    return wrap(
      <Onboarding
        onFinish={async (s) => {
          prevTotal.current = sum(s.log);
          setTab("home");
          await actions.setup(s);
        }}
      />
    );
  }

  if (mode === "cloud" && store.meId && !myPartnerId && !skipJoin && !readOnly && config.partners.some((p) => !Object.values(members).includes(p.id))) {
    return wrap(<JoinScreen config={config} members={members} onPick={(id) => actions.link(id)} onSkip={() => setSkipJoin(true)} />);
  }

  const notify = (t) => setToast({ ...t, key: Date.now() + Math.random() });
  const celebrate = (amount) => { setFlyer({ amount, key: Date.now() }); setPulse((p) => p + 1); haptic("medium"); };

  const saveMoney = async (amount, title, kind, extra = {}) => {
    const ok = await actions.addLog({ type: "saved", kind, title, amount, who: defaultWho, ...extra });
    if (!ok) return; // при ошибке — только сообщение об ошибке, без праздника
    notify({ tone: "emerald", icon: PiggyBank, title: `+${fmt(amount)} в спасённые`, text: title });
    celebrate(amount);
  };

  const handleBank = () => { if (budgetLeft > 0 && banked === 0) saveMoney(budgetLeft, "Остаток дневного бюджета", "budget"); };
  const handleWin = (h) => saveMoney(h.amount, `${h.emoji} ${h.win}`, "habit", { habitId: h.id });
  const handleAiSave = (amount, item) => { setSheet(null); saveMoney(amount, `ИИ отговорил: ${item}`, "ai"); };
  const handleAiBuy = async (amount, item, who) => {
    setSheet(null);
    if (!(await actions.addLog({ type: "expense", impulse: true, who, title: item, amount }))) return;
    notify({ tone: "rose", icon: ShoppingBag, title: `−${fmt(amount)} в расходы`, text: "Записали. Завтра отыграемся 💪" });
    haptic("light");
  };
  const handleDeposit = async (who, amount, note) => {
    setSheet(null);
    if (!(await actions.addLog({ type: "deposit", who, title: note || "Пополнение копилки", amount }))) return;
    notify({ tone: "emerald", icon: Wallet, title: `${partnerById(who).name}: +${fmt(amount)}`, text: `Ближе к цели «${config.goal.title}»` });
    celebrate(amount);
  };
  const handleExpense = async (who, amount, note) => {
    setSheet(null);
    if (!(await actions.addLog({ type: "expense", impulse: false, who, title: note || "Повседневная трата", amount }))) return;
    notify({ tone: "amber", icon: ShoppingBag, title: `Трата ${fmt(amount)} записана`, text: config.budget.enabled ? "Учтено в бюджете на сегодня" : "Добавлено в историю" });
    haptic("light");
  };

  const toggleDay = (i) => {
    const next = !challenge.days?.[i];
    actions.patchChallenge({ days: { [i]: next } });
    haptic("light");
    if (next && countDays(challenge) + 1 === 7) notify({ tone: "amber", icon: Trophy, title: "Челлендж пройден!", text: `Награда: ${challenge.reward}` });
  };
  const nextChallenge = () => {
    const c = newChallenge(config.habits, challenge);
    actions.setChallenge(c);
    const h = config.habits.find((x) => x.id === c.habitId);
    notify({ tone: "indigo", icon: Sparkles, title: "ИИ подобрал новый челлендж", text: h.challenge });
  };
  // Награду печатают по буквам — сохраняем с небольшой паузой, одной записью
  const setReward = (reward) => {
    setRewardDraft(reward);
    clearTimeout(rewardTimer.current);
    rewardTimer.current = setTimeout(() => { actions.patchChallenge({ reward }); setRewardDraft(null); }, 600);
  };
  const shownChallenge = challenge && rewardDraft !== null ? { ...challenge, reward: rewardDraft } : challenge;

  const saveSettings = async (next) => {
    const cfg = clone(next);
    cfg.partners = cfg.partners.map((p) => ({ ...p, name: p.name.trim() }));
    cfg.goal.title = cfg.goal.title.trim();
    prevTotal.current = null;
    const okCfg = await actions.saveConfig(cfg);
    if (!cfg.habits.some((h) => h.id === challenge?.habitId)) await actions.setChallenge(newChallenge(cfg.habits, null));
    if (okCfg) {
      setSettingsKey((k) => k + 1);
      notify({ tone: "emerald", icon: Check, title: "Сохранено", text: shared ? "Изменения уже у вас обоих" : "Приложение подстроилось под изменения" });
    }
  };
  const reset = async () => { setTab("home"); setSheet(null); prevTotal.current = null; await actions.reset(); };

  const NavItem = ({ id, icon: Icon, label }) => {
    const active = tab === id;
    return (
      <button onClick={() => { setTab(id); haptic("light"); }} className={`flex flex-col items-center gap-1 py-1.5 transition-all active:scale-90 ${active ? "text-slate-900" : "text-slate-400"}`}>
        <Icon size={22} strokeWidth={active ? 2.4 : 2} />
        <span className={`text-[11px] ${active ? "font-semibold" : "font-medium"}`}>{label}</span>
      </button>
    );
  };

  const titles = { stats: "Челленджи и аналитика", history: "История", settings: "Настройки" };
  const me = partnerById(myPartnerId);
  const other = config.partners.find((p) => p.id !== myPartnerId);
  const otherHere = shared && other && online.includes(other.id);
  const otherJoined = other && Object.values(members).includes(other.id);

  return wrap(
    <>
      <div className="max-w-md mx-auto min-h-screen bg-slate-50 relative pb-40">
        <header className="px-4 pt-5 pb-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex -space-x-3">
              {config.partners.map((p) => (
                <span key={p.id} className="relative">
                  <Avatar partner={p} size="w-11 h-11 text-base" />
                  {shared && online.includes(p.id) && (
                    <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-slate-50" />
                  )}
                </span>
              ))}
            </div>
            <div className="min-w-0">
              <div className="text-[15px] font-bold text-slate-900 leading-tight truncate">{config.partners.map((p) => p.name).join(" и ")}</div>
              <div className="flex items-center gap-1.5 text-[13px] text-emerald-600 font-medium mt-0.5 min-w-0">
                <span className="relative flex w-2 h-2 shrink-0">
                  <span className="relative w-2 h-2 rounded-full bg-emerald-500" />
                </span>
                <span className="truncate">
                  {otherHere ? `${other.name} сейчас тоже здесь` : me && shared ? `Вы — ${me.name} · вместе к цели` : "Вместе к цели"}
                </span>
              </div>
            </div>
          </div>
          <button onClick={() => setSheet("in")} aria-label="Пополнить копилку" className="w-11 h-11 rounded-2xl bg-white border border-slate-200 shadow-soft flex items-center justify-center text-emerald-600 transition-all active:scale-90 shrink-0">
            <Plus size={20} />
          </button>
        </header>

        <main className="px-4">
          {readOnly && (
            <div className="mb-4 rounded-2xl bg-amber-50 border border-amber-100 px-4 py-3 text-[15px] text-amber-900">
              Режим просмотра. Чтобы вносить изменения, попросите партнёра пригласить вас в Claude с правом «Редактор».
            </div>
          )}
          {mode === "local" && tab === "home" && (
            <button onClick={() => setTab("settings")} className="mb-4 w-full text-left rounded-2xl bg-slate-100 px-4 py-3 text-[13px] text-slate-600 transition-all active:scale-[0.98]">
              Сейчас данные только на этом устройстве. Общая копилка работает, когда страница открыта в Claude.
            </button>
          )}
          {tab === "home" && mode === "tg" && store.inviteLink && other && !otherJoined && (
            <div className="mb-4"><InviteCard partner={other} link={store.inviteLink} goalTitle={config.goal.title} /></div>
          )}
          {titles[tab] && <h1 className="text-2xl font-extrabold tracking-tight mb-4">{titles[tab]}</h1>}
          <div key={tab} className="anim-rise">
            {tab === "home" && (
              <Dashboard
                config={config} total={total} deposits={deposits} saved={saved}
                budgetLeft={budgetLeft} spentToday={spentToday} banked={banked} challenge={challenge}
                onBank={handleBank} onWin={handleWin} onOpenAi={() => setSheet("ai")} onOpenAdd={setSheet}
                pulse={pulse} goTab={setTab}
              />
            )}
            {tab === "stats" && (
              <Challenges
                config={config} log={log} deposits={deposits} saved={saved} challenge={shownChallenge}
                onToggleDay={toggleDay} onNextChallenge={nextChallenge} onReward={setReward} onWin={handleWin} goTab={setTab}
              />
            )}
            {tab === "history" && <HistoryTab config={config} log={log} />}
            {tab === "settings" && (
              <SettingsTab
                key={settingsKey}
                config={config}
                meId={myPartnerId}
                onSave={saveSettings}
                onReset={reset}
                sharing={<SharingCard mode={mode} config={config} members={members} myPartnerId={myPartnerId} online={online} onLink={(id) => actions.link(id)} inviteLink={store.inviteLink} />}
              />
            )}
          </div>
        </main>
      </div>

      <nav className="fixed bottom-0 inset-x-0 z-40">
        <div className="max-w-md mx-auto bg-white/90 backdrop-blur-xl border-t border-slate-200 px-3 pt-1.5 grid grid-cols-5 items-end" style={{ paddingBottom: "max(10px, env(safe-area-inset-bottom))" }}>
          <NavItem id="home" icon={Home} label="Главная" />
          <NavItem id="stats" icon={BarChart3} label="Челленджи" />
          <div className="flex flex-col items-center">
            <button onClick={() => { setSheet("ai"); haptic("medium"); }} aria-label="Огонёк · ИИ: отговорить от покупки" className="-mt-7 w-[60px] h-[60px] rounded-[22px] bg-indigo-600 shadow-soft ring-4 ring-white flex items-center justify-center transition-all active:scale-90 hover:bg-indigo-700">
              <AiAvatar size="w-11 h-11" />
            </button>
            <span className="text-[11px] font-semibold text-indigo-600 mt-1">Огонёк</span>
          </div>
          <NavItem id="history" icon={Receipt} label="История" />
          <NavItem id="settings" icon={Settings} label="Настройки" />
        </div>
      </nav>

      {toast && (
        <div className="fixed inset-x-0 z-[60] px-4 pointer-events-none" style={{ top: "max(12px, env(safe-area-inset-top))" }}>
          <div key={toast.key} className="max-w-md mx-auto anim-toast">
            <div className="bg-white rounded-2xl shadow-soft border border-slate-200 px-4 py-3 flex items-center gap-3">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${TOAST_TONES[toast.tone]}`}>{toast.icon && <toast.icon size={18} />}</div>
              <div className="min-w-0">
                <div className="text-[15px] font-semibold text-slate-900 truncate">{toast.title}</div>
                {toast.text && <div className="text-[13px] text-slate-500 truncate">{toast.text}</div>}
              </div>
            </div>
          </div>
        </div>
      )}

      {flyer && (
        <div key={flyer.key} onAnimationEnd={() => setFlyer(null)} className="fixed left-1/2 bottom-[30%] z-[55] pointer-events-none anim-fly">
          <div className="flex items-center gap-1.5 bg-honey-soft text-ink border border-honey font-bold px-4 py-2 rounded-full shadow-soft tabnum">
            <PiggyBank size={18} /> +{fmt(flyer.amount)}
          </div>
        </div>
      )}

      {sheet === "ai" && <AiSheet config={config} total={total} defaultWho={defaultWho} onClose={() => setSheet(null)} onSave={handleAiSave} onBuy={handleAiBuy} />}
      {(sheet === "in" || sheet === "out") && (
        <AddSheet key={sheet} config={config} deposits={deposits} defaultWho={defaultWho} initialMode={sheet} onClose={() => setSheet(null)} onDeposit={handleDeposit} onExpense={handleExpense} />
      )}
    </>
  );
}
