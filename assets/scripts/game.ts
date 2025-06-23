// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

const { ccclass, property } = cc._decorator;

@ccclass
export default class NewClass extends cc.Component {


    @property(cc.Node)
    carScene1: cc.Node = null;

    @property(cc.Node)
    carScene2: cc.Node = null;

    @property(cc.Node)
    shadowScene2: cc.Node = null;

    @property(cc.Label)
    moneyLabel: cc.Label = null;

    @property(cc.Node)
    btnBuy1: cc.Node = null;

    @property(cc.Prefab)
    moneyPrefab: cc.Prefab = null;

    @property(cc.Node)
    carIconList: cc.Node[] = [];

    @property(cc.Node)
    listCustomer: cc.Node = null;

    @property(cc.Node)
    btnClean: cc.Node = null;

    @property(cc.Node)
    btnPolishing: cc.Node = null;

    @property(cc.Node)
    btnUpgrade: cc.Node = null;

    @property(cc.Label)
    guideLb: cc.Label = null;

    @property(cc.Node)
    saleAnim: cc.Node = null;

    @property(cc.Node)
    endCard: cc.Node = null;

    @property(cc.AudioClip)
    bgSound: cc.AudioClip = null;

    @property(cc.AudioClip)
    clickSound: cc.AudioClip = null;

    @property(cc.AudioClip)
    moneySound: cc.AudioClip = null;

    @property(cc.AudioClip)
    upgradeSound: cc.AudioClip = null;

    @property(cc.AudioClip)
    cleanSound: cc.AudioClip = null;

    @property(cc.AudioClip)
    polishingSound: cc.AudioClip = null;

    @property(cc.AudioClip)
    customerSound: cc.AudioClip = null;

    @property(cc.AudioClip)
    saleSound: cc.AudioClip = null;

    fadeRadius: number = 0.1;

    isTransforming: boolean = false;

    step: number = 0;

    money: number = 10000;

    fadePct: number = 0;

    symbol: number = 1;

    speed: number = 3;

    priceCar: number = 5000;

    guideLbArr = ['Clean the car first', 'Nice!', 'Now let\'s polish the car', 'That\'s great!', 'Next, upgrade the car', 'Perfect!'];

    stepGuide: number = 0;

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}

    start() {
        cc.audioEngine.play(this.bgSound,true,0.5);
        this.startScene1();
    }

    startScene1() {
        cc.tween(this.carScene1).set({ position: cc.v3(-600, 350, 0), active: true }).to(0.3, { position: cc.v3(0, -100, 0) }).delay(0.15).call(() => {
            this.carScene1.getChildByName('buble').active = true;
            this.btnBuy1.active = true;
        }).start();
    }

    buyCar1() {
        // Trigger money effect from (-68,11) to (-266,492)
        cc.audioEngine.play(this.clickSound,false,1);
        this.btnBuy1.active = false;
        this.carScene1.getChildByName('buble').active = true;
        this.moveMoney(cc.v3(-68, 11, 0), cc.v3(-266, -492, 0), 10);
    }

    moveMoney(start: cc.Vec3, end: cc.Vec3, waveNum: number) {
        // Spawn 10 waves of money, each wave has 5 money with specific patterns
        for (let wave = 0; wave < waveNum; wave++) {
            this.scheduleOnce(() => {
                // Spawn 5 money per wave with synchronized paths
                for (let i = 0; i < 5; i++) {
                    this.scheduleOnce(() => {
                        this.createSynchronizedMoneyPath(start, end, i);
                    }, i * 0.02); // Very small delay for visual effect
                }
            }, wave * 0.15); // 0.15s delay between waves
        }
    }

    createSynchronizedMoneyPath(start: cc.Vec3, end: cc.Vec3, index: number) {
        let moneyNode = cc.instantiate(this.moneyPrefab);
        this.moneyLabel.node.parent.addChild(moneyNode);
        moneyNode.position = start;

        let duration = 0.5;
        let curveHeight = index === 2 ? 0 : (index === 1 || index === 3) ? 60 : 120;
        let curveDirection = (index < 2) ? -1 : 1;

        // Common scale and fade effects
        let scaleEffect = cc.tween().to(0.1, { scaleX: 1.3, scaleY: 1.3 }).to(0.3, { scaleX: 0.9, scaleY: 0.9 }).to(0.1, { scaleX: 0.6, scaleY: 0.6 });

        if (index === 2) {
            // Straight movement
            cc.tween(moneyNode).parallel(cc.tween().to(duration, { position: end }), scaleEffect).call(() => {
                if (moneyNode && moneyNode.isValid) {
                    moneyNode.destroy();
                }
                if (this.carScene1.parent.active == true || this.step == 3) {
                    this.addMoney((this.step == 3) ? 200 : -100);
                    if (this.money == 5000 && this.carScene1.parent.active == true) {
                        cc.tween(this.carScene1).delay(0.25).to(0.25, { position: cc.v3(600, -350, 0) }).call(() => {
                            this.startScene2();
                        }).start();
                    }
                }
            }).start();
        } else {
            // Curved movement
            this.createCurvedMovement(moneyNode, start, end, duration, curveHeight, curveDirection, scaleEffect);
        }
    }

    createCurvedMovement(moneyNode: cc.Node, start: cc.Vec3, end: cc.Vec3, duration: number, curveHeight: number, curveDirection: number, scaleEffect: any) {
        let isDestroyed = false;

        cc.tween(moneyNode)
            .parallel(
                cc.tween().call(() => {
                    let startTime = Date.now();
                    let updatePos = () => {
                        if (isDestroyed || !moneyNode || !moneyNode.isValid) return;

                        let elapsed = (Date.now() - startTime) / 1000;
                        let t = Math.min(elapsed / duration, 1);

                        if (t >= 1) {
                            if (moneyNode && moneyNode.isValid) {
                                moneyNode.position = end;
                            }
                            return;
                        }

                        let centerX = start.x + (end.x - start.x) * t;
                        let centerY = start.y + (end.y - start.y) * t;
                        let controlX = centerX + curveDirection * curveHeight;
                        let oneMinusT = 1 - t;

                        let x = oneMinusT * oneMinusT * start.x + 2 * oneMinusT * t * controlX + t * t * end.x;
                        let y = oneMinusT * oneMinusT * start.y + 2 * oneMinusT * t * centerY + t * t * end.y;

                        moneyNode.position = cc.v3(x, y, 0);
                        if (t < 1) requestAnimationFrame(updatePos);
                    };
                    updatePos();
                }).delay(duration),
                scaleEffect
            )
            .call(() => {
                isDestroyed = true;
                if (moneyNode && moneyNode.isValid) {
                    moneyNode.stopAllActions();
                    moneyNode.destroy();
                    
                }
                if (this.carScene1.parent.active == true || this.step == 3) {
                    this.addMoney((this.step == 3) ? 200 : -100);
                    if (this.money == 5000 && this.carScene1.parent.active == true) {
                        cc.tween(this.carScene1).delay(0.25).to(0.25, { position: cc.v3(600, -350, 0) }).call(() => {
                            this.startScene2();
                        }).start();
                    }
                }
            })
            .start();
    }

    addMoney(money: number) {
        cc.audioEngine.play(this.moneySound,false,0.25);
        this.money += money;
        this.moneyLabel.string = this.money.toString();
    }

    addPriceCar(price: number) {
        this.priceCar += price;
        this.carScene2.getChildByName('bid').getChildByName('moneylb').getComponent(cc.Label).string = this.priceCar.toString();
    }

    startScene2() {
        this.carScene1.parent.active = false;
        this.carScene2.parent.active = true;
        cc.tween(this.carScene2).set({ position: cc.v3(-625, 425, 0), active: true }).to(0.25, { position: cc.v3(-36, 50, 0) }).delay(0.25).call(() => {
            this.carScene2.getChildByName('bid').active = true;
            let listBtn = this.carScene2.parent.getChildByName('listBtn');
            cc.tween(listBtn).set({ active: true, scaleY: 0 }).to(0.2, { scaleY: 1 }).call(() => {
                this.btnClean.active = true;
                this.btnClean.getChildByName('hand').active = true;
            }).start();
            this.shadowScene2.active = true;
            this.showGuide();
        }).start();
    }

    showGuide(time: number = 1) {
        this.guideLb.string = this.guideLbArr[this.stepGuide];
        let staff = this.guideLb.node.parent.parent;
        let buble = this.guideLb.node.parent;
        buble.stopAllActions();
        staff.active = true;
        cc.tween(buble).set({ scaleY: 0 }).to(0.15, { scaleY: 1 }).delay(time).to(0.15, { scaleY: 0 }).call(() => {
            staff.active = false;
        }).start();
        this.stepGuide++;
    }

    actionCar(event: cc.Event.EventTouch) {
        if (this.isTransforming) return;
        cc.audioEngine.play(this.clickSound,false,1);
        this.isTransforming = true;
        let btn = event.target;
        this.symbol = 1;
        this.speed = 1;
        this.fadePct = 0;
        this.shadowScene2.active = false;
        if (this.step == 0) {
            this.carScene2.getChildByName('clean').active = true;
            this.carScene2.getChildByName('clean').getComponent(cc.Animation).play();
            this.moveBid(1000);
            btn.getChildByName('shadow').active = true;
            this.btnClean.getChildByName('hand').active = false;
            this.showGuide(0.5);
            cc.audioEngine.play(this.cleanSound,false,1);
        }
        if (this.step == 1) {
            this.carScene2.getChildByName('polishing').active = true;
            this.carScene2.getChildByName('polishing').getComponent(cc.Animation).play();
            this.moveBid(2000);
            btn.getChildByName('shadow').active = true;
            this.btnPolishing.getChildByName('hand').active = false;
            this.showGuide(0.5);
            cc.audioEngine.play(this.polishingSound,false,1);
        }
    }
    upgradeCar(event: cc.Event.EventTouch) {
        cc.audioEngine.play(this.clickSound,false,1);
        this.shadowScene2.active = false;
        this.carScene2.getChildByName('upgrade').active = true;
        this.moveBid(2000);
        let btn = event.target;
        btn.getChildByName('shadow').active = true;
        this.carIconList[this.step].active = false;
        this.btnUpgrade.getChildByName('hand').active = false;
        this.showGuide(0.5);
        cc.audioEngine.play(this.upgradeSound,false,1);
        this.scheduleOnce(() => {
            cc.tween(this.btnClean.parent).to(0.2, { scaleY: 0 }).call(() => {
                this.btnClean.parent.active = false;
            }).start();
            let bid = this.carScene2.getChildByName('bid');
            let buble = this.carScene2.getChildByName('buble');
            cc.tween(bid).to(0.2, { scaleY: 0 }).call(() => {
                bid.active = false;
            }).start();
            cc.tween(buble).to(0.2, { scaleY: 1 }).call(() => {
                this.listCustomer.active = true;
                cc.audioEngine.play(this.customerSound,false,1);
                this.listCustomer.children.forEach((child, index) => {
                    child.active = true;
                    cc.tween(child).set({ scale: 0, active: true }).to(0.2, { scale: 1 }).start();
                });
            }).start();
            this.scheduleOnce(() => {
                this.listCustomer.active = false;
                this.step = 3;
                this.moveMoney(cc.v3(-266, -492, 0), cc.v3(-68, 11, 0), 10);
                this.scheduleOnce(()=>{
                    this.saleAnim.active = true;
                    cc.audioEngine.play(this.saleSound,false,1);
                },0.5);
                this.scheduleOnce(()=>{
                    cc.tween(this.endCard).set({active:true,scale:0}).to(0.2,{scale:1}).start();
                },2);
            }, 1);
        }, 1);

    }
    moveBid(money: number) {
        this.addMoney(-500);
        this.moveMoney(cc.v3(-265, -375, 0), cc.v3(-265, -265, 0), 4);
        let bidNode = this.carScene2.getChildByName('bid');
        bidNode.getChildByName('border_bar').active = true;
        let moneyLb = bidNode.getChildByName('moneylb');
        let posDelta = 250 / 5000 * money;
        cc.tween(moneyLb).by(0.5, { position: cc.v3(posDelta, 0, 0) }).start();
        cc.tween(bidNode).repeat(4,
            cc.tween().to(0.1, { scale: 0.8 }).call(() => {
                this.addPriceCar(money / 4);
            }).to(0.1, { scale: 0.7 })
        ).call(() => {
            bidNode.getChildByName('border_bar').active = false;
        }).start();

    }
    update(dt) {
        if (!this.isTransforming) return;
        this.carIconList[this.step].getComponent(cc.Sprite).getMaterial(0).setProperty('fade_pct', this.fadePct);
        if (this.fadePct >= 0 && this.fadePct <= 1) {
            this.fadePct += this.symbol * dt * this.speed;
        } else {
            this.fadePct = this.fadePct > 1 ? 1 : 0;
            this.symbol = -this.symbol;
            this.isTransforming = false;
            this.carIconList[this.step].active = false;
            this.step++;
            if (this.step == 1) {
                this.scheduleOnce(() => {
                    this.showGuide(1);
                    this.btnClean.getComponent(cc.Button).enabled = false;
                    this.btnPolishing.getComponent(cc.Button).enabled = true;
                    this.btnPolishing.getChildByName('hand').active = true;
                    this.shadowScene2.active = true;
                }, 0.5);
            }
            if (this.step == 2) {
                this.scheduleOnce(() => {
                    this.showGuide(1);
                    this.btnPolishing.getComponent(cc.Button).enabled = false;
                    this.btnUpgrade.getComponent(cc.Button).enabled = true;
                    this.btnUpgrade.getChildByName('hand').active = true;
                    this.shadowScene2.active = true;
                }, 0.5);

            }
        }
    }
}
