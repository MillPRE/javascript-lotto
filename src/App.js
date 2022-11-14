const utils = require("./utils");
const Constant = require("./Constant");
const Lotto = require("./Lotto");
const MissionUtils = require("@woowacourse/mission-utils");


class App {
  #price; // 로또 구입금액
  #lottoNumber; // 구입 로또 갯수
  #Lotto; // 발급 받은 로또 배열
  #winnerNumber; // 당첨 번호
  #bonus; // 보너스 번호
  #statistics; // 당첨 통계
  #winnings; // 당첨금

  constructor() {
    this.#price = 0;
    this.#lottoNumber = 0;
    this.#Lotto = [];
    this.#bonus = 0;
    this.#winnerNumber = '';
    this.#statistics = [];
    this.#winnings = 0;
  }

  play() {
    this.#price = utils.scan(Constant.MESSAGE.GAME_START_MSG);
    utils.onlyNumber(this.#price);
    this.#lottoNumber = this.#getLottoNumber();
    if(this.#lottoNumber === -1){
      throw Error();
    }

    utils.print(this.#lottoNumber+"개를 구매했습니다.");
    // 로또 발급
    this.#Lotto = this.#issueLotto();

    // statistics 초기화
    for(let i = 0 ; i < Constant.LOTTO_LENGTH ; i++){
      this.#statistics[i] = 0;
    }

    // 당첨 번호 입력 받는 로직
    this.#winnerNumber = utils.scan(Constant.MESSAGE.LOTTO_NUMBER_INPUT).split(',');
    utils.validateLotto(this.#winnerNumber);

    // 보너스 번호 입력
    this.#bonus = utils.scan(Constant.MESSAGE.BONUS_NUMBER_INPUT);
    this.#validateBonus();

    for(let i = 0 ; i < this.#lottoNumber ; i++){
      this.#Lotto[i].calcRanking(this.#winnerNumber, this.#bonus);
      if(this.#Lotto[i].rank.rank !== 0) this.#statistics[(this.#Lotto[i].rank.rank)-1] ++;
      this.#winnings += this.#Lotto[i].rank.winnings;
    }

    this.#statisticsWinnings();
    const ror = this.#calcYield();
    utils.print("총 수익률은 "+ror+"%입니다.");
  }

  // 수익률 계산
  #calcYield(){
    // 100 - ((당첨금 - 로또 구매 가격) / (로또 구매 가격) ) * 100
    return 100 + ((this.#winnings - this.#price) /(this.#price)) * 100;
  }

  // 당첨 통계
  #statisticsWinnings(){
     // utils.print(Constant.MESSAGE.WINNING_STATISTICS);
     for(let i = Constant.RANK - 1 ; i >= 0 ; i--){
       utils.print(Constant.RANKING[i]+this.#statistics[i]+"개");
     }
  }

  /***
   * lotto 발급하는 함수
   */
  #issueLotto(){
    // 로또 번호는 오름차순으로 정렬
    const result = [];
    for(let i = 0 ; i < this.#lottoNumber ; i++){
      let tmp = MissionUtils.Random.pickUniqueNumbersInRange(1, 45, Constant.LOTTO_LENGTH);
      tmp = tmp.sort((a,b) => utils.ascSort(a, b));
      utils.arrayPrint(tmp);
      result.push(new Lotto(tmp));
    }
    return result;
  }

  /***
   * @returns {number}
   * 사용자가 입력한 구입금액이 1000원 단위라면 price/1000을 return
   * 아니라면 -1을 return하는 함수
   */
  #getLottoNumber(){
    if(this.#price % 1000 === 0){
      return this.#price / 1000;
    }
    return -1;
  }

  #validateBonus(){
    if(this.#winnerNumber.includes(this.#bonus)) throw new Error("[ERROR] 보너스 번호가 당첨 번호와 중복됩니다.");
  }
}

module.exports = App;
