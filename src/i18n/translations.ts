export type Lang = "ru" | "kk";
export const LANGS: ReadonlyArray<{ code: Lang; label: string }> = [
  { code: "ru", label: "RU" },
  { code: "kk", label: "ҚАЗ" },
];

type Dict = Record<string, string>;

export const translations: Record<Lang, Dict> = {
  ru: {
    "app.tagline": "Калькулятор платежа",
    "landing.title": "Калькулятор ежемесячного платежа",
    "landing.subtitle":
      "Узнайте платёж по квартире за несколько секунд: выберите программу, укажите стоимость и первоначальный взнос.",

    "field.cost": "Стоимость квартиры",
    "field.downPayment": "Первоначальный взнос",
    "field.program": "Программа покупки",
    "field.rate": "Ставка, % годовых",
    "field.term": "Срок, месяцев",
    "field.cost.aria": "Стоимость квартиры в тенге",
    "field.rate.aria": "Ставка в процентах годовых",
    "field.term.aria": "Срок в месяцах",
    "field.dpPercent.aria": "Первоначальный взнос, процент",
    "field.dpAmount.aria": "Первоначальный взнос, тенге",
    "field.dpSlider.aria": "Ползунок первоначального взноса",
    "field.dpUnit.aria": "Единица первоначального взноса",

    "calc.error": "Проверьте поля: стоимость и срок должны быть больше нуля, взнос — не больше стоимости.",

    "result.label": "Ежемесячный платёж",
    "result.perMonth": "в месяц",
    "result.installment": "рассрочка",
    "result.annual": "годовых",
    "result.cost": "Стоимость квартиры",
    "result.downPayment": "Первоначальный взнос",
    "result.loanInstallment": "Сумма рассрочки",
    "result.loanCredit": "Сумма кредита",
    "result.overpayment": "Переплата",
    "result.total": "Итоговая стоимость",
    "result.program": "Программа",
    "result.cardTitle": "Расчёт ежемесячного платежа",

    "term.months": "мес.",
    "term.year": "год",
    "term.years2": "года",
    "term.years5": "лет",

    "action.print": "Распечатать",
    "action.copy": "Скопировать",
    "action.copied": "Скопировано ✓",
    "action.pdf": "Скачать PDF",
    "action.pdfBusy": "Готовим…",
    "action.clientLink": "Ссылка клиенту",
    "action.linkCopied": "Ссылка скопирована ✓",
    "action.conditions": "Условия программы",

    "bitrix.loading": "Загрузка калькулятора…",
    "bitrix.save": "Сохранить в сделку",
    "bitrix.saving": "Сохраняем…",
    "bitrix.saved": "Сохранено в сделку ✓",

    "modal.requirements": "Требования к клиенту",
    "modal.bank": "Банк / оператор",
    "modal.projects": "Доступно по проектам",
    "modal.conditionsHead": "Условия программы",
    "modal.close": "Закрыть",
    "modal.rate": "Ставка",
    "modal.term": "Срок",
    "modal.dp": "Взнос",

    "lead.title": "Получить консультацию",
    "lead.subtitle": "Оставьте телефон — менеджер перезвонит и поможет с расчётом и подбором.",
    "lead.name": "Ваше имя",
    "lead.phone": "Телефон",
    "lead.consent":
      "Я согласен(а) на сбор и обработку моих персональных данных в соответствии с законодательством Республики Казахстан и даю согласие на обратный звонок.",
    "lead.submit": "Получить консультацию",
    "lead.submitting": "Отправляем…",
    "lead.successTitle": "Заявка принята",
    "lead.successText": "Менеджер Atamura Group перезвонит вам с готовым расчётом.",
    "lead.errorRequired": "Укажите имя, корректный телефон и подтвердите согласие.",
    "lead.errorSend": "Не удалось отправить. Попробуйте ещё раз или позвоните нам.",

    "footer.disclaimer":
      "Расчёт носит информационный характер и не является публичной офертой. Точные ставки, сроки и условия программ уточняйте у менеджеров Atamura Group и банков-партнёров.",

    "client.title": "Ваш расчёт платежа",
    "client.subtitle": "Предварительный расчёт от Atamura Group.",
    "client.unavailableTitle": "Расчёт недоступен",
    "client.unavailableText":
      "Ссылка устарела или неполна. Запросите новый расчёт у менеджера Atamura Group.",
    "client.customProgram": "Индивидуальные условия",

    "ctrl.theme.aria": "Переключить тему",
    "ctrl.lang.aria": "Сменить язык",
  },
  kk: {
    "app.tagline": "Төлем калькуляторы",
    "landing.title": "Айлық төлем калькуляторы",
    "landing.subtitle":
      "Пәтер бойынша төлемді бірнеше секундта біліңіз: бағдарламаны таңдап, құны мен бастапқы жарнаны көрсетіңіз.",

    "field.cost": "Пәтер құны",
    "field.downPayment": "Бастапқы жарна",
    "field.program": "Сатып алу бағдарламасы",
    "field.rate": "Мөлшерлеме, % жылдық",
    "field.term": "Мерзім, ай",
    "field.cost.aria": "Пәтердің теңгемен құны",
    "field.rate.aria": "Жылдық пайыздық мөлшерлеме",
    "field.term.aria": "Айлық мерзім",
    "field.dpPercent.aria": "Бастапқы жарна, пайыз",
    "field.dpAmount.aria": "Бастапқы жарна, теңге",
    "field.dpSlider.aria": "Бастапқы жарна жүгірткісі",
    "field.dpUnit.aria": "Бастапқы жарна бірлігі",

    "calc.error": "Өрістерді тексеріңіз: құны мен мерзім нөлден жоғары, жарна құннан аспауы тиіс.",

    "result.label": "Айлық төлем",
    "result.perMonth": "айына",
    "result.installment": "бөліп төлеу",
    "result.annual": "жылдық",
    "result.cost": "Пәтер құны",
    "result.downPayment": "Бастапқы жарна",
    "result.loanInstallment": "Бөліп төлеу сомасы",
    "result.loanCredit": "Несие сомасы",
    "result.overpayment": "Артық төлем",
    "result.total": "Жалпы құны",
    "result.program": "Бағдарлама",
    "result.cardTitle": "Айлық төлем есебі",

    "term.months": "ай",
    "term.year": "жыл",
    "term.years2": "жыл",
    "term.years5": "жыл",

    "action.print": "Басып шығару",
    "action.copy": "Көшіру",
    "action.copied": "Көшірілді ✓",
    "action.pdf": "PDF жүктеу",
    "action.pdfBusy": "Дайындаудамыз…",
    "action.clientLink": "Клиентке сілтеме",
    "action.linkCopied": "Сілтеме көшірілді ✓",
    "action.conditions": "Бағдарлама шарттары",

    "bitrix.loading": "Калькулятор жүктелуде…",
    "bitrix.save": "Мәмілеге сақтау",
    "bitrix.saving": "Сақталуда…",
    "bitrix.saved": "Мәмілеге сақталды ✓",

    "modal.requirements": "Клиентке қойылатын талаптар",
    "modal.bank": "Банк / оператор",
    "modal.projects": "Жобалар бойынша қолжетімді",
    "modal.conditionsHead": "Бағдарлама шарттары",
    "modal.close": "Жабу",
    "modal.rate": "Мөлшерлеме",
    "modal.term": "Мерзім",
    "modal.dp": "Жарна",

    "lead.title": "Кеңес алу",
    "lead.subtitle": "Телефоныңызды қалдырыңыз — менеджер қайта қоңырау шалып, есеп пен таңдауға көмектеседі.",
    "lead.name": "Атыңыз",
    "lead.phone": "Телефон нөмірі",
    "lead.consent":
      "Қазақстан Республикасының заңнамасына сәйкес дербес деректерімді жинауға және өңдеуге, кері қоңырауға келісім беремін.",
    "lead.submit": "Кеңес алу",
    "lead.submitting": "Жіберудеміз…",
    "lead.successTitle": "Өтінім қабылданды",
    "lead.successText": "Atamura Group менеджері дайын есеппен сізге қайта қоңырау шалады.",
    "lead.errorRequired": "Атыңызды, дұрыс телефонды көрсетіп, келісімді растаңыз.",
    "lead.errorSend": "Жіберу мүмкін болмады. Қайталап көріңіз немесе бізге қоңырау шалыңыз.",

    "footer.disclaimer":
      "Есеп ақпараттық сипатта және жария оферта болып табылмайды. Нақты мөлшерлемелерді, мерзімдер мен шарттарды Atamura Group менеджерлерінен және серіктес банктерден нақтылаңыз.",

    "client.title": "Сіздің төлем есебіңіз",
    "client.subtitle": "Atamura Group-тан алдын ала есеп.",
    "client.unavailableTitle": "Есеп қолжетімсіз",
    "client.unavailableText":
      "Сілтеме ескірген немесе толық емес. Atamura Group менеджерінен жаңа есеп сұраңыз.",
    "client.customProgram": "Жеке шарттар",

    "ctrl.theme.aria": "Тақырыпты ауыстыру",
    "ctrl.lang.aria": "Тілді ауыстыру",
  },
};
