// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

const { ccclass, property } = cc._decorator;
import Scratch_ticket from './Scratch_ticket';
@ccclass
export default class NewClass extends cc.Component {

    @property(cc.Node)
    listCar:cc.Node = null;

    @property(cc.Node)
    handSwipe:cc.Node = null;

    @property(cc.Node)
    hand:cc.Node = null;

    @property(cc.Node)
    scene0:cc.Node = null;

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
    cleanItem: cc.Node = null;

    @property(cc.Node)
    polishingItem: cc.Node = null;

    @property(cc.Node)
    upgradeItem: cc.Node = null;

    @property(cc.Node)
    listCustomer: cc.Node = null;

    @property(cc.Node)
    btnClean: cc.Node = null;

    @property(cc.Node)
    btnPolishing: cc.Node = null;

    @property(cc.Node)
    touchNode: cc.Node = null;

    @property(cc.Node)
    touchNode2: cc.Node = null;

    @property(cc.Node)
    btnUpgrade: cc.Node = null;

    @property(cc.Label)
    guideLb: cc.Label = null;

    @property(cc.Label)
    cleanLb: cc.Label = null;

    @property(cc.Node)
    guideClean: cc.Node = null;

    @property(cc.Node)
    guidePolishing: cc.Node = null;

    @property(cc.Node)
    guideUpgrade: cc.Node = null;

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

    @property(cc.AudioClip)
    carSound: cc.AudioClip = null;

    @property(cc.AudioClip)
    swipeSound: cc.AudioClip = null;

    fadeRadius: number = 0.1;

    isTransforming: boolean = false;

    step: number = 0;

    money: number = 10000;

    fadePct: number = 0;

    symbol: number = 1;

    speed: number = 0.5;

    priceCar: number = 5000;

    isClean: boolean = false;

    isPolishing: boolean = false;

    isUpgrade: boolean = false;

    guideLbArr = ['Clean the car first', 'Nice!', 'Now let\'s polish the car', 'That\'s great!', 'Next, upgrade the car', 'Perfect!'];

    stepGuide: number = 0;

    // Variables for scratch ticket functionality
    private scratchTicket: Scratch_ticket = null;
    private scratchTicket2: Scratch_ticket = null;
    private hasCompletedCleaning: boolean = false;
    private hasCompletedPolishing: boolean = false;
    private hasCompletedUpgrade: boolean = false;

    // Thuộc tính cho tính năng vuốt
    private currentIndex: number = 0;
    private isDragging: boolean = false;
    private startTouchPos: cc.Vec2 = cc.Vec2.ZERO;
    private lastTouchPos: cc.Vec2 = cc.Vec2.ZERO;
    private carPositions: number[] = [0,450, 900, 1350, 1800];
    private isSwipeGesture: boolean = false;
    private touchStartTime: number = 0;

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}

    start() {
        cc.audioEngine.play(this.bgSound, true, 0.5);
        // this.startScene1();
        this.initSwipeFeature();
        
        // Setup scratch ticket component
        if (this.touchNode) {
            this.scratchTicket = this.touchNode.getComponent(Scratch_ticket);
        }
        if (this.touchNode2) {
            this.scratchTicket2 = this.touchNode2.getComponent(Scratch_ticket);
        }
        
        // Setup canvas touch events for cleanItem movement
        this.setupCanvasTouchEvents();
    }

    private initSwipeFeature() {
        // Bật touch events cho node chính (cho swipe)
        this.scene0.on(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.scene0.on(cc.Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
        this.scene0.on(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this);
        this.scene0.on(cc.Node.EventType.TOUCH_CANCEL, this.onTouchEnd, this);
        
        // Gắn touch events cho từng node con trong listCar
        this.setupCarTouchEvents();
    }

    private setupCarTouchEvents() {
        if (!this.listCar || this.listCar.children.length === 0) return;
        
        this.listCar.children.forEach((child, index) => {
            if (index < this.carPositions.length) {
                // Bật touch cho từng car node
                child.on(cc.Node.EventType.TOUCH_START, (event) => this.onCarTouchStart(event, index), this);
                child.on(cc.Node.EventType.TOUCH_END, (event) => this.onCarTouchEnd(event, index), this);
            }
        });
    }

    private onCarTouchStart(event: cc.Event.EventTouch, carIndex: number) {
        // Ghi nhận touch start cho car cụ thể
        this.touchStartTime = Date.now();
        console.log(`Car ${carIndex} touch start`);
    }

    private onCarTouchEnd(event: cc.Event.EventTouch, carIndex: number) {
        const touchDuration = Date.now() - this.touchStartTime;
        const maxClickDuration = 300; // Thời gian tối đa cho click (ms)
        
        // Chỉ xử lý click nếu thời gian touch ngắn và không có swipe gesture
        if (touchDuration < maxClickDuration && !this.isSwipeGesture) {
            this.onCarSelected(carIndex);
        }
    }

    private onCarSelected(carIndex: number) {
        console.log(`Car ${carIndex} selected!`);
        
        // Chỉ xử lý nếu car được click đang ở vị trí x = 0 (giữa màn hình)
        if (carIndex === this.currentIndex) {
            console.log(`Car ${carIndex} is in center, executing action...`);
            // Thực hiện hành động khi click vào car ở giữa
            this.selectCar();
        } else {
            // Nếu click vào car khác, di chuyển car đó về giữa
            console.log(`Moving car ${carIndex} to center...`);
            this.currentIndex = carIndex;
            this.moveCarsToCenter();
        }
    }

    private onTouchStart(event: cc.Event.EventTouch) {
        this.isDragging = true;
        this.startTouchPos = event.getLocation();
        this.lastTouchPos = this.startTouchPos;
        this.isSwipeGesture = false;
        this.touchStartTime = Date.now();
    }

    private onTouchMove(event: cc.Event.EventTouch) {
        if (!this.isDragging) return;
        
        this.lastTouchPos = event.getLocation();
        
        // Tính khoảng cách di chuyển
        const deltaX = Math.abs(this.lastTouchPos.x - this.startTouchPos.x);
        const deltaY = Math.abs(this.lastTouchPos.y - this.startTouchPos.y);
        const minMoveThreshold = 20; // Khoảng cách tối thiểu để xem là swipe
        
        // Nếu di chuyển đủ xa và chủ yếu theo trục X, coi là swipe gesture
        if (deltaX > minMoveThreshold && deltaX > deltaY) {
            this.isSwipeGesture = true;
            
            // Ngăn chặn sự kiện click button khi đang swipe
            event.stopPropagation();
        }
    }

    private onTouchEnd(event: cc.Event.EventTouch) {
        if (!this.isDragging) return;
        
        this.isDragging = false;
        const touchDuration = Date.now() - this.touchStartTime;
        const deltaX = this.lastTouchPos.x - this.startTouchPos.x;
        const minSwipeDistance = 80; // Khoảng cách tối thiểu để xem là vuốt
        const maxClickDuration = 300; // Thời gian tối đa cho click (ms)
        
        this.handSwipe.active = false;
        this.hand.active = true;
        
        // Kiểm tra xem có phải là swipe gesture không
        if (this.isSwipeGesture && Math.abs(deltaX) > minSwipeDistance) {
            // Ngăn chặn sự kiện click button
            event.stopPropagation();
            
            if (deltaX > 0) {
                // Vuốt sang phải - chuyển về node trước
                this.swipeToPrevious();
            } else {
                // Vuốt sang trái - chuyển đến node tiếp theo
                this.swipeToNext();
            }
        } else if (!this.isSwipeGesture && touchDuration < maxClickDuration) {
            // Đây là click ngắn, cho phép button xử lý
            // Không làm gì để button có thể nhận sự kiện
        }
        
        // Reset trạng thái
        this.isSwipeGesture = false;
    }

    private swipeToNext() {
        if (this.currentIndex < this.carPositions.length - 1) {
            this.currentIndex++;
            this.moveCarsToCenter();
        }
    }

    private swipeToPrevious() {
        if (this.currentIndex > 0) {
            this.currentIndex--;
            this.moveCarsToCenter();
        }
    }

    private setupCarPositions() {
        // Thiết lập vị trí ban đầu cho các node con
        if (this.listCar && this.listCar.children.length > 0) {
            this.listCar.children.forEach((child, index) => {
                if (index < this.carPositions.length) {
                    child.setPosition(this.carPositions[index], child.position.y);
                }
            });
        }
    }

    private centerCurrentCar() {
        if (!this.listCar || this.listCar.children.length === 0) return;
        this.moveCarsToCenter();
    }

    private moveCarsToCenter() {
        if (!this.listCar || this.listCar.children.length === 0) return;
        // cc.audioEngine.play(this.swipeSound, false, 1);
        // Di chuyển mượt mà tất cả các node con sử dụng tween
        this.listCar.children.forEach((child, index) => {
            if (index < this.carPositions.length) {
                // Tính toán vị trí mới dựa trên index hiện tại
                const targetX = this.carPositions[index] - this.carPositions[this.currentIndex];
                
                // Sử dụng cc.tween để tạo hiệu ứng di chuyển mượt mà
                cc.tween(child)
                    .to(0.4, { position: cc.v3(targetX, child.position.y, child.position.z) }, { easing: 'backOut' })
                    .start();
            }
        });
    }

    // Hàm để chuyển đến node con cụ thể (có thể gọi từ UI)
    public goToCar(index: number) {
        if (index >= 0 && index < this.carPositions.length) {
            this.currentIndex = index;
            this.moveCarsToCenter();
        }
    }

    // Hàm để lấy index hiện tại
    public getCurrentCarIndex(): number {
        return this.currentIndex;
    }

    selectCar() {
        cc.audioEngine.play(this.clickSound, false, 1);
        this.listCar.active = false;
        this.hand.active = false;
        this.carScene1.parent.active = true;
        this.scene0.active = false;
        this.startScene1();
        this.scene0.off(cc.Node.EventType.TOUCH_START);
        this.scene0.off(cc.Node.EventType.TOUCH_MOVE);
        this.scene0.off(cc.Node.EventType.TOUCH_END);
        this.scene0.off(cc.Node.EventType.TOUCH_CANCEL);
    }

    setupCanvasTouchEvents() {
        // Add touch events to the main node (canvas) for cleanItem movement
        this.node.on(cc.Node.EventType.TOUCH_START, this.onCanvasTouchStart, this);
        this.node.on(cc.Node.EventType.TOUCH_MOVE, this.onCanvasTouchMove, this);
        this.node.on(cc.Node.EventType.TOUCH_END, this.onCanvasTouchEnd, this);
        this.node.on(cc.Node.EventType.TOUCH_CANCEL, this.onCanvasTouchEnd, this);
    }

    onCanvasTouchStart(event: cc.Event.EventTouch) {
        this.handleCanvasTouch(event);
    }

    onCanvasTouchMove(event: cc.Event.EventTouch) {
        this.handleCanvasTouch(event);
    }

    handleCanvasTouch(event: cc.Event.EventTouch) {
        let worldPos = event.getLocation();
        let nodePos = this.node.convertToNodeSpaceAR(worldPos);
        
        // Handle cleanItem movement for step 0
        if (this.step === 0 && this.isClean && this.cleanItem && this.cleanItem.active) {
            this.cleanItem.position = cc.v3(nodePos.x, nodePos.y, 0);
            
            // Check if touch is within touchNode bounds and manually trigger scratch
            if (this.touchNode && this.touchNode.active && this.scratchTicket) {
                if (this.isPointInNode(worldPos, this.touchNode)) {
                    // Create a fake event with the same structure as original touch event
                    this.triggerScratchEvent(this.scratchTicket, worldPos);
                    
                    // Hide guide and play sound on first touch
                    if (this.guideClean && this.guideClean.active) {
                        this.guideClean.active = false;
                        cc.audioEngine.playMusic(this.cleanSound, true);
                    }
                }
            }
        }
        
        // Handle polishingItem movement for step 1
        if (this.step === 1 && this.isPolishing && this.polishingItem && this.polishingItem.active) {
            this.polishingItem.position = cc.v3(nodePos.x, nodePos.y, 0);
            
            // Check if touch is within touchNode2 bounds and manually trigger scratch
            if (this.touchNode2 && this.touchNode2.active && this.scratchTicket2) {
                if (this.isPointInNode(worldPos, this.touchNode2)) {
                    // Create a fake event with the same structure as original touch event
                    this.triggerScratchEvent(this.scratchTicket2, worldPos);
                    
                    // Hide guide and play sound on first touch
                    if (this.guidePolishing && this.guidePolishing.active) {
                        this.guidePolishing.active = false;
                        cc.audioEngine.playMusic(this.polishingSound, true);
                    }
                }
            }
        }

        if(this.step == 2 && this.isUpgrade && this.upgradeItem && this.upgradeItem.active) {
            this.upgradeItem.position = cc.v3(nodePos.x, nodePos.y, 0);
            if (this.guideUpgrade && this.guideUpgrade.active) {
                this.guideUpgrade.active = false;
            }
            
            // Check if upgradeItem is dragged into carIconList[2] area
            if (this.carIconList[2] && this.carIconList[2].active && !this.hasCompletedUpgrade) {
                if (this.isPointInNode(worldPos, this.carIconList[2])) {
                    // Trigger upgrade when item is dragged into car area
                    this.hasCompletedUpgrade = true;
                    this.triggerUpgrade();
                }
            }
        }
    }

    triggerScratchEvent(scratchTicket: Scratch_ticket, worldPos: cc.Vec2) {
        // Create a fake event object that mimics the original touch event
        let fakeEvent = {
            getLocation: () => worldPos
        };
        
        // Call the scratch ticket's touchMoveEvent directly with the fake event
        scratchTicket.touchMoveEvent(fakeEvent);
    }

    isPointInNode(worldPos: cc.Vec2, targetNode: cc.Node): boolean {
        // Convert world position to target node's local space
        let localPos = targetNode.convertToNodeSpaceAR(worldPos);
        let size = targetNode.getContentSize();
        
        // Check if point is within node bounds
        return localPos.x >= -size.width/2 && localPos.x <= size.width/2 &&
               localPos.y >= -size.height/2 && localPos.y <= size.height/2;
    }

    onCanvasTouchEnd(event: cc.Event.EventTouch) {
        // Optional: Handle touch end if needed
    }

    onDestroy() {
        // Cleanup canvas touch events
        this.node.off(cc.Node.EventType.TOUCH_START, this.onCanvasTouchStart, this);
        this.node.off(cc.Node.EventType.TOUCH_MOVE, this.onCanvasTouchMove, this);
        this.node.off(cc.Node.EventType.TOUCH_END, this.onCanvasTouchEnd, this);
        this.node.off(cc.Node.EventType.TOUCH_CANCEL, this.onCanvasTouchEnd, this);
    }

    startScene1() {
        cc.audioEngine.play(this.carSound, false, 1);
        cc.tween(this.carScene1).set({ position: cc.v3(-600, 350, 0), active: true }).to(0.7, { position: cc.v3(-32, 64, 0) }).delay(0.15).call(() => {
            this.carScene1.getChildByName('buble').active = true;
            this.btnBuy1.active = true;
        }).start();
    }

    buyCar1() {
        // Trigger money effect from (-68,11) to (-266,492)
        cc.audioEngine.play(this.clickSound, false, 1);
        this.btnBuy1.active = false;
        this.carScene1.getChildByName('buble').active = false;
        
        // Convert carScene1 position to world space, then to moneyLabel's parent space
        let worldPos = this.carScene1.parent.convertToWorldSpaceAR(this.carScene1.position.add(cc.v3(0,80)));
        let targetPos = this.moneyLabel.node.parent.convertToNodeSpaceAR(worldPos);
        this.moveMoney(cc.v3(-68, 11, 0), targetPos, 10);
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
                        cc.tween(this.carScene1).delay(0.25).to(0.5, { position: cc.v3(600, -350, 0) }).call(() => {
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
                        cc.tween(this.carScene1).delay(0.25).to(0.5, { position: cc.v3(600, -350, 0) }).call(() => {
                            this.startScene2();
                        }).start();
                    }
                }
            })
            .start();
    }

    addMoney(money: number) {
        cc.audioEngine.play(this.moneySound, false, 0.4);
        this.money += money;
        this.moneyLabel.string = this.money.toString();
    }

    addPriceCar(price: number) {
        this.priceCar += price;
        if (this.priceCar > 10000) {
            this.priceCar = 10000;
        }
        this.carScene2.getChildByName('bid').getChildByName('moneylb').getComponent(cc.Label).string = this.priceCar.toString();
    }

    startScene2() {
        this.carScene1.parent.active = false;
        this.carScene2.parent.active = true;
        cc.audioEngine.play(this.carSound, false, 1);
        cc.tween(this.carScene2).set({ position: cc.v3(-625, 425, 0), active: true }).to(0.5, { position: cc.v3(-15, 70, 0) }).delay(0.25).call(() => {
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

    showGuide(time: number = 1.5) {
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
        cc.audioEngine.play(this.clickSound, false, 1);
        this.isTransforming = true;
        let btn = event.target;
        this.symbol = 1;
        this.speed = 1;
        this.fadePct = 0;
        
        if (this.step == 0) {
            // this.carScene2.getChildByName('clean').active = true;
            // this.carScene2.getChildByName('clean').getComponent(cc.Animation).play();
            // this.moveBid(1000);  
            btn.getComponent(cc.Button).enabled = false;
            btn.getChildByName('shadow').active = true;
            this.btnClean.getChildByName('hand').active = false;
            let staff = this.guideLb.node.parent.parent;
            staff.active = false;
            staff.stopAllActions();
            this.cleanLb.node.active = true;
            // this.showGuide(0.75);
            // cc.audioEngine.play(this.cleanSound,false,1);
            
            // Enable cleaning mode
            this.isClean = true;
            this.hasCompletedCleaning = false;
            if (this.cleanItem) {
                this.cleanItem.active = true;
                this.guideClean.active = true;
            }
            if (this.touchNode) {
                this.touchNode.active = true;
            }
            
            // Reset scratch ticket
            if (this.scratchTicket) {
                this.scratchTicket.reset();
            }
        }
        if (this.step == 1) {
            // this.carScene2.getChildByName('polishing').active = true;
            // this.carScene2.getChildByName('polishing').getComponent(cc.Animation).play();
            // this.moveBid(2000);
            btn.getComponent(cc.Button).enabled = false;
            btn.getChildByName('shadow').active = true;
            this.btnPolishing.getChildByName('hand').active = false;
            // this.showGuide(0.75);
            // cc.audioEngine.play(this.polishingSound, false, 1);
            this.isPolishing = true;
            this.hasCompletedPolishing = false;
            if (this.polishingItem) {
                this.polishingItem.active = true;
                this.guidePolishing.active = true;
            }
            if(this.touchNode2) {
                this.touchNode2.active = true;
            }
            if(this.scratchTicket2) {
                this.scratchTicket2.reset();
            }
        }
        if(this.step == 2) {
            btn.getComponent(cc.Button).enabled = false;
            btn.getChildByName('shadow').active = true;
            this.btnUpgrade.getChildByName('hand').active = false;
            this.upgradeItem.active = true;
            this.guideUpgrade.active = true;
            this.isUpgrade = true;
            this.hasCompletedUpgrade = false;
            }
        }
    nextStep() {
        this.shadowScene2.active = false;
        if (this.step == 0) {
            this.showGuide(0.75);
            this.moveBid(1000);
            this.cleanItem.active = false;
            this.touchNode.active = false;
            this.carIconList[0].active = false;
            this.cleanLb.node.active = false;
            cc.audioEngine.stopMusic();
            this.scheduleOnce(() => {
                this.showGuide(1);
                this.btnClean.getComponent(cc.Button).enabled = false;
                this.btnPolishing.getComponent(cc.Button).enabled = true;
                this.btnPolishing.getChildByName('hand').active = true;
                this.shadowScene2.active = true;
            }, 0.75);
        }
        if(this.step == 1) {
            this.moveBid(2000);
            this.showGuide(0.75);
            this.polishingItem.active = false;
            this.touchNode2.active = false;
            this.carIconList[1].active = false;
            cc.audioEngine.stopMusic();
            this.scheduleOnce(() => {
                this.showGuide(1);
                this.btnPolishing.getComponent(cc.Button).enabled = false;
                this.btnUpgrade.getComponent(cc.Button).enabled = true;
                this.btnUpgrade.getChildByName('hand').active = true;
                this.shadowScene2.active = true;
            }, 0.75);
        }
        this.step++;

    }
    upgradeCar(event: cc.Event.EventTouch) {
        cc.audioEngine.play(this.clickSound, false, 1);
        this.shadowScene2.active = false;
        this.carScene2.getChildByName('upgrade').active = true;
        this.moveBid(2000);
        let btn = event.target;
        btn.getChildByName('shadow').active = true;
        this.carIconList[this.step].active = false;
        this.btnUpgrade.getChildByName('hand').active = false;
        this.showGuide(0.75);
        cc.audioEngine.play(this.upgradeSound, false, 1);
        this.scheduleOnce(() => {
            cc.tween(this.btnClean.parent).to(0.2, { scaleY: 0 }).call(() => {
                this.btnClean.parent.active = false;
            }).start();
            let bid = this.carScene2.getChildByName('bid');
            let buble = this.carScene2.getChildByName('buble');
            let aurora = this.carScene2.getChildByName('aura');
            let title = this.carScene2.getChildByName('title');
            this.shadowScene2.active = true;
            cc.tween(bid).to(0.2, { scaleY: 0 }).call(() => {
                bid.active = false;
            }).start();
            aurora.active = true;
            cc.tween(title).set({active:true,scale:0}).to(0.2, { scale: 1 }).start();
            cc.tween(buble).to(0.2, { scaleY: 1 }).delay(1).call(() => {
                this.listCustomer.active = true;
                title.active = false;
                cc.audioEngine.play(this.customerSound, false, 1);
                this.listCustomer.children.forEach((child, index) => {
                    child.active = true;
                    cc.tween(child).set({ scale: 0, active: true }).to(0.25, { scale: 1 }).start();
                });
            }).start();
            this.scheduleOnce(() => {
                this.carScene2.getChildByName('buble').active = false;
                this.step = 3;
                this.moveMoney(cc.v3(-266, -492, 0), cc.v3(-68, 11, 0), 10);
                this.scheduleOnce(() => {
                    this.saleAnim.active = true;
                    this.listCustomer.active = false;
                    cc.audioEngine.play(this.saleSound, false, 1);
                }, 0.5);
                this.scheduleOnce(() => {
                    cc.tween(this.endCard).set({ active: true, scale: 0 }).to(0.2, { scale: 1 }).call(() => {
                        this.node.getChildByName('logo').active = false;
                        this.node.getChildByName('btnDownload').active = false;
                    }).start();
                }, 2.5);
            }, 4);
        }, 1);

    }

    triggerUpgrade() {
        cc.audioEngine.play(this.clickSound, false, 1);
        this.shadowScene2.active = false;
        this.carScene2.getChildByName('upgrade').active = true;
        this.moveBid(2000);
        
        // Hide upgrade item and disable upgrade mode
        this.upgradeItem.active = false;
        this.isUpgrade = false;
        
        this.carIconList[this.step].active = false;
        this.btnUpgrade.getChildByName('hand').active = false;
        this.btnUpgrade.getComponent(cc.Button).enabled = false;
        this.btnUpgrade.getChildByName('shadow').active = true;
        this.showGuide(0.75);
        cc.audioEngine.play(this.upgradeSound, false, 1);
        this.scheduleOnce(() => {
            cc.tween(this.btnClean.parent).to(0.2, { scaleY: 0 }).call(() => {
                this.btnClean.parent.active = false;
            }).start();
            let bid = this.carScene2.getChildByName('bid');
            let buble = this.carScene2.getChildByName('buble');
            let aurora = this.carScene2.getChildByName('aura');
            let title = this.carScene2.getChildByName('title');
            this.shadowScene2.active = true;
            cc.tween(bid).to(0.2, { scaleY: 0 }).call(() => {
                bid.active = false;
            }).start();
            aurora.active = true;
            cc.tween(title).set({active:true,scale:0}).to(0.2, { scale: 1 }).start();
            cc.tween(buble).to(0.2, { scaleY: 1 }).delay(1).call(() => {
                this.listCustomer.active = true;
                title.active = false;
                cc.audioEngine.play(this.customerSound, false, 1);
                this.listCustomer.children.forEach((child, index) => {
                    child.active = true;
                    cc.tween(child).set({ scale: 0, active: true }).to(0.25, { scale: 1 }).start();
                });
            }).start();
            this.scheduleOnce(() => {
                this.carScene2.getChildByName('buble').active = false;
                this.step = 3;
                this.moveMoney(cc.v3(-266, -492, 0), cc.v3(-68, 11, 0), 10);
                this.scheduleOnce(() => {
                    this.saleAnim.active = true;
                    this.listCustomer.active = false;
                    cc.audioEngine.play(this.saleSound, false, 1);
                }, 0.5);
                this.scheduleOnce(() => {
                    cc.tween(this.endCard).set({ active: true, scale: 0 }).to(0.2, { scale: 1 }).call(() => {
                        this.node.getChildByName('logo').active = false;
                        this.node.getChildByName('btnDownload').active = false;
                    }).start();
                }, 2.5);
            }, 4);
        }, 1);
    }

    moveBid(money: number) {
        this.addMoney(-500);
        let worldPos = this.carScene2.parent.convertToWorldSpaceAR(this.carScene2.position.add(cc.v3(0,80)));
        let targetPos = this.moneyLabel.node.parent.convertToNodeSpaceAR(worldPos);
        this.moveMoney(cc.v3(-265, -450, 0), targetPos.add(cc.v3(0,150)), 4);
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
    setScreenSize(isHorizontal) {
        let canvas = this.node.getComponent(cc.Canvas);
        canvas.fitHeight = (isHorizontal) ? true : false;
        canvas.fitWidth = (isHorizontal) ? false : true;
    }
    responsive() {
        let deviceResolution = cc.view.getFrameSize();
        if (deviceResolution.width >= deviceResolution.height) {
            this.setScreenSize(true);
        }
        else if (deviceResolution.width < deviceResolution.height) {
            this.setScreenSize(false);
        }
    }
    update(dt) {
        this.responsive();
        
        // Check scratch ticket progress for cleaning step
        if (this.step === 0 && this.isClean && this.scratchTicket && !this.hasCompletedCleaning) {
            let progress = this.scratchTicket.progress;
            if (progress > 45) {
                // Cleaning completed
                this.hasCompletedCleaning = true;
                this.isClean = false;
                this.isTransforming = false;
                
                // Hide clean item and touch node
                if (this.cleanItem) {
                    this.cleanItem.active = false;
                }
                if (this.touchNode) {
                    this.touchNode.active = false;
                }
                
                // Hide car icon
                if (this.carIconList[0]) {
                    this.carIconList[0].active = false;
                }
                
                // Proceed to next step
                this.nextStep();
            }
        }
        if (this.step === 1 && this.isPolishing && this.scratchTicket2 && !this.hasCompletedPolishing) {
            let progress = this.scratchTicket2.progress;
            if (progress > 40) {
                // Polishing completed
                this.hasCompletedPolishing = true;
                this.isPolishing = false;
                this.isTransforming = false;

                // Hide polishing item and touch node
                if (this.polishingItem) {
                    this.polishingItem.active = false;
                }
                if (this.touchNode2) {
                    this.touchNode2.active = false;
                }

                // Hide car icon
                if (this.carIconList[1]) {
                    this.carIconList[1].active = false;
                }

                // Proceed to next step
                this.nextStep();
            }
        }
        
        // if (!this.isTransforming) return;
        // this.carIconList[this.step].getComponent(cc.Sprite).getMaterial(0).setProperty('fade_pct', this.fadePct);
        // if (this.fadePct >= 0 && this.fadePct <= 1) {
        //     this.fadePct += this.symbol * dt * this.speed;
        // } else {
        //     this.fadePct = this.fadePct > 1 ? 1 : 0;
        //     this.symbol = -this.symbol;
        //     this.isTransforming = false;
        //     this.carIconList[this.step].active = false;
        //     this.step++;
        //     if (this.step == 1) {
        //         this.scheduleOnce(() => {
        //             this.showGuide(1);
        //             this.btnClean.getComponent(cc.Button).enabled = false;
        //             this.btnPolishing.getComponent(cc.Button).enabled = true;
        //             this.btnPolishing.getChildByName('hand').active = true;
        //             this.shadowScene2.active = true;
        //         }, 0.5);
        //     }
        //     if (this.step == 2) {
        //         this.scheduleOnce(() => {
        //             this.showGuide(1);
        //             this.btnPolishing.getComponent(cc.Button).enabled = false;
        //             this.btnUpgrade.getComponent(cc.Button).enabled = true;
        //             this.btnUpgrade.getChildByName('hand').active = true;
        //             this.shadowScene2.active = true;
        //         }, 0.5);

        //     }
        // }
    }
}
