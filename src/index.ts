const nextActions = ['play again','exit'] as const
type NextActions = typeof nextActions[number]

//ゲームの選択肢を設定
const gameTitles = ["hit and blow", "janken"] as const;
type GameTitles = typeof gameTitles[number];

//ゲームストアの型を設定
type GamaStore = {
    'hit and blow': HitAndBrow
    'janken': Janken
}

class GameProcedure {
    // private currentGameTitle = "hit and blow"
    private currentGameTitle:GameTitles | '' = '' //union 初期値を空文字
    // private currentGame = new HitAndBrow() //
    private currentGame: HitAndBrow | Janken | null = null //初期値はnull

    //constructor宣言時にプロパティを設定できる
    constructor(private readonly gameStore: GamaStore){}

    public async start(){
        await this.select()
        await this.play()
    }

    private async select(){
        this.currentGameTitle = 
        await promptSelect('ゲームのタイトルを入力してください',gameTitles)
        this.currentGame = this.gameStore[this.currentGameTitle]
    }

    private async play(){
        if(!this.currentGame) throw new Error("ゲームが選択されていません");
        
        printLine(`============\n${this.currentGameTitle}を開始します\n===========`);
        await this.currentGame.setting()
        await this.currentGame.play()
        //降参判定（途中中止）
        // if (this.currentGame.getJudge()) {
        //     this.currentGame.giveup()
        // } else {
            this.currentGame.end()
        // }

        const action = await promptSelect<NextActions>('ゲームを続けますか？',nextActions);

        if (action === 'exit') {
            this.end();  
        }else if (action === 'play again') {
            await this.play(); //再度あそぶ
        } else {
            const neverValue:never = action //到達が期待されていない
            throw new Error(`${neverValue} is an invalid action`);
        }
    }

    private end(){
        printLine(`ゲームを終了しました`);
        process.exit();
    }
}


const modes = ["normal", "hard","very hard"] as const
type Mode = typeof modes[number]

class HitAndBrow {
    //class宣言時の初期値格納
    private readonly answerSource = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"] //型推論により型必要なし
    private answer: string[] = []; //正解
    private tryCount = 0 //型推論により型必要なし
    private mode: Mode = "normal" //Mode型の中からnormalを設定

    private judge = false //降参する場合

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

        printLine("降参する場合は「give up」と入力してください。")
    }

    async play(){
        const answerLength = this.getAnswerLength()
        const inputArr = (
            await promptInput(
                `「,」区切りで${answerLength}つの数字を入力してください`
            )
        ).split(",");

        //giveup
        if (inputArr[0] === "give up") {
            this.judge = true //降参する
            return
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
            //正解時
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
        this.reset()
    }

    giveup(){
        printLine(`残念でした、正解は[ ${this.answer} ]です\n試行回数: ${this.tryCount}回`);
        this.reset();
    }

    private reset(){
        this.answer = [] //答えを初期化
        this.tryCount = 0 //回数を初期化
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

    getJudge(){
        return this.judge        
    }
}

const jankenOptions = ["rock", "paper", "scissors"] as const;
type JankenOption = typeof jankenOptions[number];

class Janken {
    private rounds = 0;
    private currentRound = 1;
    private result = {
        win: 0,
        lose: 0,
        draw: 0,
    };

    async setting() {
        const rounds = Number(await promptInput("何本勝負にしますか？"));
        if (Number.isInteger(rounds) && 0 < rounds) {
        this.rounds = rounds;
        } else {
        await this.setting();
        }
    }

    async play() {
        const userSelected = await promptSelect(
        `【${this.currentRound}回戦】選択肢を入力してください。`,
        jankenOptions
        );
        const randomSelected = jankenOptions[Math.floor(Math.random() * 3)];
        const result = Janken.judge(userSelected, randomSelected);
        let resultText: string;

        switch (result) {
        case "win":
            this.result.win += 1;
            resultText = "勝ち";
            break;
        case "lose":
            this.result.lose += 1;
            resultText = "負け";
            break;
        case "draw":
            this.result.draw += 1;
            resultText = "あいこ";
            break;
        }
        printLine(
        `---\nあなた: ${userSelected}\n相手${randomSelected}\n${resultText}\n---`
        );

        if (this.currentRound < this.rounds) {
        this.currentRound += 1;
        await this.play();
        }
    }

    end() {
        printLine(
        `\n${this.result.win}勝${this.result.lose}敗${this.result.draw}引き分けでした。`
        );
        this.reset();
    }

    private reset() {
        this.rounds = 0;
        this.currentRound = 1;
        this.result = {
        win: 0,
        lose: 0,
        draw: 0,
        };
    }

    static judge(userSelected: JankenOption, randomSelected: JankenOption) {
        if (userSelected === "rock") {
        if (randomSelected === "rock") return "draw";
        if (randomSelected === "paper") return "lose";
        return "win";
        } else if (userSelected === "paper") {
        if (randomSelected === "rock") return "win";
        if (randomSelected === "paper") return "draw";
        return "lose";
        } else {
        if (randomSelected === "rock") return "lose";
        if (randomSelected === "paper") return "win";
        return "draw";
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
}

;(async()=>{
    new GameProcedure({
        'hit and blow': new HitAndBrow(),
        'janken': new Janken()
    }).start()
})()
