

const modes = ["normal", "hard","very hard"] as const
type Mode = typeof modes[number]

class HitAndBrow {
    //class宣言時の初期値格納
    private readonly answerSource = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"] //型推論により型必要なし
    private answer: string[] = []; //正解
    private tryCount = 0 //型推論により型必要なし
    private mode: Mode = "normal" //Mode型の中からnormalを設定

    //関数
    async setting() {
        this.mode = (await promptSelect<Mode>("モードを入力してください",modes)) 

        //modeによって入力値を変更
        const answerLength = this.getAnswerLength();

        while (this.answer.length < answerLength) {
            const randNum = Math.floor(Math.random() * this.answerSource.length);
            const selectedItem = this.answerSource[randNum];
            if (!this.answer.includes(selectedItem)) {
                this.answer.push(selectedItem);
            }
        }
    }

    async play() {
        const answerLength = this.getAnswerLength()
        const inputArr = (
            await promptInput(
                `「,」区切りで${answerLength}つの数字を入力してください`
            )
        ).split(",");

        //giveup
        if (inputArr[0] === "giveup") {
            this.giveup()
        }

        console.log("入力された数値は", inputArr, "です");

        if(!this.validate(inputArr)){
            printLine('無効な入力です、再度入力してください')
            await this.play()
            return
        }

        const reslut = this.check(inputArr);
        if (reslut.hit !== this.answer.length) {
            printLine(`---\nHit: ${reslut.hit}\nBlow:${reslut.blow}\n---`);
            this.tryCount += 1;
            await this.play();
        } else {
            this.tryCount += 1;
        }
    }

    //
    private check(input: string[]) {
        let hitCount = 0;
        let blowCount = 0;

        input.forEach((val, index) => {
            if (val === this.answer[index]) {
                hitCount += 1;
            } else if (this.answer.includes(val)) {
                blowCount += 1;
            }
        });

        return {
            hit: hitCount,
            blow: blowCount,
        };
    }

    //入力制御
    private validate(inputArr: string[]){
        //入力桁数の制限
        const isLengthValid = inputArr.length === this.answer.length
        //0-9の数字が入力されているか？
        const isAllAnswerSourceOption = inputArr.every((val)=> this.answerSource.includes(val))
        //入力した数字は重複していないか？
        const isAllDiffrentValues = inputArr.every((val,i)=> inputArr.indexOf(val) === i )

        return isLengthValid && isAllAnswerSourceOption && isAllDiffrentValues
    }

    //終了
    end(){
        printLine(`正解です! \n試行回数: ${this.tryCount}回`)
        process.exit()
    }

    giveup(){
        printLine(`正解は : ${this.answer}です`);
        process.exit();
    }

    //mode変更
    private getAnswerLength() {
        switch (this.mode) {
            case "normal":
                return 3;
            case "hard":
                return 4;
            case "very hard":
                return 5;
            default:
                const neverValue: never = this.mode;
                throw new Error(`${neverValue} は無効なモードです`); 
        }
    }
}


//対話用
const printLine = (text: string, breakLine: boolean = true ) =>{
    process.stdout.write(text + (breakLine ? '\n' : ''))
}

const promptInput = async(text: string) => {
    printLine(`\n${text}\n>`,false)
    return readLine()
};

const readLine = async () => {
    const input: string = await new Promise((resolve) =>
        process.stdin.once("data", (data) => resolve(data.toString()))
    );
    return input.trim();
};

    const promptSelect = async <T extends string>(text: string,values: readonly T[]): Promise<T> => {
    printLine(`\n${text}\n>`);
    //表示
    values.forEach((value)=> {
        printLine(`- ${value}`);
    })

    const input = (await readLine()) as T //Tがstringを継承した型に設定することで解決
    if(values.includes(input)){
        return input
    }else{
        printLine(`\n再入力してください`);
        return promptSelect<T>(text,values)
    }
};

//test
;(async()=>{
    const hitAndBrow = new HitAndBrow()
    await hitAndBrow.setting() //設定開始
    await hitAndBrow.play() //この処理が終わるまで操作
    hitAndBrow.end() //console end
})()



