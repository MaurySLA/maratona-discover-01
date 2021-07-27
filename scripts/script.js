const Modal = {
    newTransation() {
        //Abre o Modal adicionando a classe active
        document.querySelector('.modal-overlay').classList.add('active')
    },
    closeWindow() {
        //Fecha o Modal removendo a classe active
        document.querySelector('.modal-overlay').classList.remove('active')
    }
}

const sample = [
    {
        description: "Salário",
        amount: 400000,
        date: "23/01/2021"
    },
    {
        description: "Luz",
        amount: -10000,
        date: "23/01/2021"
    },
    {
        description: "Internet",
        amount: -9999,
        date: "23/01/2021"
    }]

//Abaixo, vai guardar tudo em um armazenamento local em arquivo JSON
//Não consegui fazer funcionar o armazenamento no navegador
const Storage = {
    get() {
        console.log(localStorage)
        return JSON.parse(localStorage.getItem("finances:transactions")) || []
    },
    set(transactions) {
        localStorage.setItem("finances:transactions", JSON.stringify(transactions))
    }
}

const Transaction = {
    all: [],
    //Pegar transações via JS e colocar no HTML
    //all: Storage.get(),
    add(transaction) {
        Transaction.all.push(transaction)
        App.reload()
    },
    remove(index) {
        Transaction.all.splice(index, 1)
        App.reload()
    },
    incomes() {
        //Soma as entradas
        let income = 0;
        Transaction.all.forEach((transaction) => {
            if (transaction.amount > 0) {
                income += transaction.amount;
            }
        })
        return income
    },
    expenses() {
        //Soma as saídas
        let expense = 0;
        Transaction.all.forEach((transaction) => {
            if (transaction.amount <= 0) {
                expense += transaction.amount;
            }
        })
        return expense
    },
    total() {
        //Calcula entradas - saídas
        return Transaction.incomes() + Transaction.expenses()
    }
}

const DOM = {
    transactionsContainer: document.querySelector("#data-table tbody"),
    addTransaction(transaction, index) {
        const tr = document.createElement('tr')
        tr.innerHTML = DOM.innerHTMLTransaction(transaction, index)
        tr.dataset.index = index
        DOM.transactionsContainer.appendChild(tr)
    },
    innerHTMLTransaction(transaction, index) {
        const CSSclass = transaction.amount > 0 ? "income" : "expense"
        const amount = Utils.formatCurrency(transaction.amount)
        //`` essa marcação é um litteral, semelhante a uma String mas que permite usar códigos e variáveis
        const html = `
            <td class="description">${transaction.description}</td>
            <td class="${CSSclass}">${amount}</td>
            <td class="date">${transaction.date}</td>
            <td><img onclick="Transaction.remove(${index})" src="./images/minus.svg" alt="Remover transação"></td>
        `
        return html
    },
    updateBalance() {
        document.getElementById("incomeDisplay").innerHTML = Utils.formatCurrency(Transaction.incomes())
        document.getElementById("expenseDisplay").innerHTML = Utils.formatCurrency(Transaction.expenses())
        document.getElementById("totalDisplay").innerHTML = Utils.formatCurrency(Transaction.total())
    },
    clearTransactions() {
        DOM.transactionsContainer.innerHTML = ""
    }
}

const Utils = {
    formatAmount(value) {
        value = (value * 100)
        return Math.round(value)
    },
    formatDate(date) {
        const splittedDate = date.split("-")
        return `${splittedDate[2]}/${splittedDate[1]}/${splittedDate[0]}`
    },
    formatCurrency(value) {
        const signal = Number(value) < 0 ? "-" : ""
        value = String(value).replace(/\D/g, "")
        value = Number(value) / 100
        value = value.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL"
        })
        return signal + value
    }
}

const Form = {
    description: document.querySelector("input#description"),
    amount: document.querySelector("input#amount"),
    date: document.querySelector("input#date"),
    getValues() {
        return {
            description: Form.description.value,
            amount: Form.amount.value,
            date: Form.date.value
        }
    },
    validateFields() {
        const { description, amount, date } = Form.getValues()
        if (description.trim() === "" || amount.trim() === "" || date.trim() === "") {
            throw new Error("Por favor preencha todos os campos")
        }
    },
    formatValues() {
        let { description, amount, date } = Form.getValues()
        amount = Utils.formatAmount(amount)
        date = Utils.formatDate(date)
        return {
            description,
            amount,
            date
        }
    },
    clearFields() {
        Form.description.value = ""
        Form.amount.value = ""
        Form.date.value = ""
    },
    submit(event) {
        event.preventDefault()
        try {
            Form.validateFields()
            const transaction = Form.formatValues()
            Transaction.add(transaction)
            Form.clearFields()
            Modal.closeWindow()
        } catch (error) {
            alert(error.message)
        }
    }
}

const App = {
    init() {
        Transaction.all.forEach(DOM.addTransaction)
        //Transaction.all.forEach((transaction, index) => {
        //    DOM.addTransaction(transaction, index)
        //})
        DOM.updateBalance()
        //Storage.set(Transaction.all)
    },
    reload() {
        DOM.clearTransactions()
        App.init()
    },
}

App.init()
