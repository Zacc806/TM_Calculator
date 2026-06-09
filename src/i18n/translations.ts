export type Lang = "ru" | "kk" | "en";
export const LANGS: ReadonlyArray<{ code: Lang; label: string }> = [
  { code: "ru", label: "RU" },
  { code: "kk", label: "ҚАЗ" },
  { code: "en", label: "EN" },
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
    "result.otbasyNote":
      "Расчёт приблизительный. Для более точного нужны данные оценочного показателя, вознаграждения и основной суммы займа — точные расчёты и информация в отделе продаж.",
    "result.standardNote":
      "Расчёт приблизительный. Точная информация — в отделе продаж и у менеджеров банка.",
    "result.firstYears": "первые ~8 лет",
    "result.then": "далее",
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
    "modal.tabConditions": "Условия",
    "modal.tabRequirements": "Требования",
    "modal.tabProjects": "Проекты",
    "modal.tabBank": "Банк",

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
    "landing.title": "Ай сайынғы төлем калькуляторы",
    "landing.subtitle":
      "Пәтер бойынша ай сайынғы төлеміңізді білу үшін: бағдарламаны таңдап, құны мен бастапқы жарнаны көрсетіңіз.",

    "field.cost": "Пәтер құны",
    "field.downPayment": "Бастапқы жарна",
    "field.program": "Сатып алу бағдарламасы",
    "field.rate": "Мөлшерлеме, жылдық %",
    "field.term": "Мерзім, ай",
    "field.cost.aria": "Пәтердің теңгемен құны",
    "field.rate.aria": "Жылдық пайыздық мөлшерлеме",
    "field.term.aria": "Мерзімі, ай",
    "field.dpPercent.aria": "Бастапқы жарна, пайыз",
    "field.dpAmount.aria": "Бастапқы жарна, теңге",
    "field.dpSlider.aria": "Бастапқы жарна жүгірткісі",
    "field.dpUnit.aria": "Бастапқы жарна бірлігі",

    "calc.error": "Өрістерді тексеріңіз: құны мен мерзімі нөлден жоғары болуы тиіс, жарна құнынан аспауы тиіс.",

    "result.label": "Ай сайынғы төлем",
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
    "result.otbasyNote":
      "Есеп шамамен. Дәлірегі үшін бағалау көрсеткіші, сыйақы және негізгі қарыз сомасы туралы деректер қажет — нақты есептер мен ақпарат сату бөлімінде.",
    "result.standardNote":
      "Есеп шамамен. Нақты ақпарат — сату бөлімінде және банк менеджерлерінде.",
    "result.firstYears": "алғашқы ~8 жыл",
    "result.then": "одан кейін",
    "result.cardTitle": "Ай сайынғы төлем есебі",

    "term.months": "ай",
    "term.year": "жыл",
    "term.years2": "жыл",
    "term.years5": "жыл",

    "action.print": "Басып шығару",
    "action.copy": "Көшіру",
    "action.copied": "Көшірілді ✓",
    "action.pdf": "PDF жүктеп алу",
    "action.pdfBusy": "Дайындалуда…",
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
    "modal.term": "Мерзімі",
    "modal.dp": "Бастапқы жарна",
    "modal.tabConditions": "Шарттар",
    "modal.tabRequirements": "Талаптар",
    "modal.tabProjects": "Жобалар",
    "modal.tabBank": "Банк",

    "lead.title": "Кеңес алу",
    "lead.subtitle": "Телефон нөміріңізді қалдырыңыз — менеджер қайта қоңырау шалып, есеп пен таңдауға көмектеседі.",
    "lead.name": "Атыңыз",
    "lead.phone": "Телефон нөмірі",
    "lead.consent":
      "Қазақстан Республикасының заңнамасына сәйкес дербес деректерімді жинауға және өңдеуге келісемін әрі кері қоңырауға келісім беремін.",
    "lead.submit": "Кеңес алу",
    "lead.submitting": "Жіберілуде…",
    "lead.successTitle": "Өтінім қабылданды",
    "lead.successText": "Atamura Group менеджері дайын есеппен сізге қайта қоңырау шалады.",
    "lead.errorRequired": "Атыңызды және дұрыс телефон нөмірін көрсетіп, келісімді растаңыз.",
    "lead.errorSend": "Жіберу мүмкін болмады. Қайталап көріңіз немесе бізге қоңырау шалыңыз.",

    "footer.disclaimer":
      "Есеп ақпараттық сипатта болып табылады және жария оферта болып табылмайды. Нақты мөлшерлемелерді, мерзімдер мен шарттарды Atamura Group менеджерлерінен және серіктес банктерден нақтылаңыз.",

    "client.title": "Сіздің төлем есебіңіз",
    "client.subtitle": "Atamura Group-тан алдын ала есеп.",
    "client.unavailableTitle": "Есеп қолжетімсіз",
    "client.unavailableText":
      "Сілтеме ескірген немесе толық емес. Atamura Group менеджерінен жаңа есеп сұраңыз.",
    "client.customProgram": "Жеке шарттар",

    "ctrl.theme.aria": "Тақырыпты ауыстыру",
    "ctrl.lang.aria": "Тілді ауыстыру",
  },
  en: {
    "app.tagline": "Payment calculator",
    "landing.title": "Monthly payment calculator",
    "landing.subtitle":
      "Find out your apartment payment in seconds: pick a program, then enter the price and the down payment.",

    "field.cost": "Apartment price",
    "field.downPayment": "Down payment",
    "field.program": "Purchase program",
    "field.rate": "Interest rate, % per year",
    "field.term": "Term, months",
    "field.cost.aria": "Apartment price in tenge",
    "field.rate.aria": "Annual interest rate, percent",
    "field.term.aria": "Term in months",
    "field.dpPercent.aria": "Down payment, percent",
    "field.dpAmount.aria": "Down payment, tenge",
    "field.dpSlider.aria": "Down payment slider",
    "field.dpUnit.aria": "Down payment unit",

    "calc.error": "Check the fields: price and term must be greater than zero, and the down payment must not exceed the price.",

    "result.label": "Monthly payment",
    "result.perMonth": "per month",
    "result.installment": "installment",
    "result.annual": "per year",
    "result.cost": "Apartment price",
    "result.downPayment": "Down payment",
    "result.loanInstallment": "Installment amount",
    "result.loanCredit": "Loan amount",
    "result.overpayment": "Overpayment",
    "result.total": "Total cost",
    "result.program": "Program",
    "result.otbasyNote":
      "Estimate. A precise figure needs the valuation score, the remuneration and the principal loan amount — exact calculations and details are with the sales department.",
    "result.standardNote":
      "Estimate. For exact details, contact the sales department and the bank's managers.",
    "result.firstYears": "first ~8 years",
    "result.then": "then",
    "result.cardTitle": "Monthly payment calculation",

    "term.months": "mo.",
    "term.year": "year",
    "term.years2": "years",
    "term.years5": "years",

    "action.print": "Print",
    "action.copy": "Copy",
    "action.copied": "Copied ✓",
    "action.pdf": "Download PDF",
    "action.pdfBusy": "Preparing…",
    "action.clientLink": "Client link",
    "action.linkCopied": "Link copied ✓",
    "action.conditions": "Program terms",

    "bitrix.loading": "Loading the calculator…",
    "bitrix.save": "Save to deal",
    "bitrix.saving": "Saving…",
    "bitrix.saved": "Saved to deal ✓",

    "modal.requirements": "Borrower requirements",
    "modal.bank": "Bank / operator",
    "modal.projects": "Available in these projects",
    "modal.conditionsHead": "Program terms",
    "modal.close": "Close",
    "modal.rate": "Rate",
    "modal.term": "Term",
    "modal.dp": "Down payment",
    "modal.tabConditions": "Terms",
    "modal.tabRequirements": "Requirements",
    "modal.tabProjects": "Projects",
    "modal.tabBank": "Bank",

    "lead.title": "Get a consultation",
    "lead.subtitle": "Leave your phone number — a manager will call you back and help you with the calculation and choosing an apartment.",
    "lead.name": "Your name",
    "lead.phone": "Phone",
    "lead.consent":
      "I consent to the collection and processing of my personal data in accordance with the laws of the Republic of Kazakhstan and agree to a callback.",
    "lead.submit": "Get a consultation",
    "lead.submitting": "Sending…",
    "lead.successTitle": "Request received",
    "lead.successText": "An Atamura Group manager will call you back with the completed calculation.",
    "lead.errorRequired": "Enter your name, a valid phone number, and confirm consent.",
    "lead.errorSend": "Couldn't send. Please try again or call us.",

    "footer.disclaimer":
      "This calculation is for information only and is not a public offer. Confirm exact rates, terms, and program conditions with Atamura Group managers and partner banks.",

    "client.title": "Your payment calculation",
    "client.subtitle": "Preliminary calculation from Atamura Group.",
    "client.unavailableTitle": "Calculation unavailable",
    "client.unavailableText":
      "The link is outdated or incomplete. Request a new calculation from an Atamura Group manager.",
    "client.customProgram": "Custom terms",

    "ctrl.theme.aria": "Toggle theme",
    "ctrl.lang.aria": "Change language",
  },
};
