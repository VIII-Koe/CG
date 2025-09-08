// Learn TypeScript:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/life-cycle-callbacks.html

const { ccclass, property } = cc._decorator;

@ccclass
export default class NewClass extends cc.Component {

    @property(cc.Node)
    listCar: cc.Node = null;

    @property(cc.Node)
    handSwipe: cc.Node = null;

    @property(cc.VideoPlayer)
    video: cc.VideoPlayer = null;

    @property(cc.Node)
    endCard: cc.Node = null;

    @property(cc.Node)
    linkToStore: cc.Node = null;

    @property(cc.Node)
    hand: cc.Node = null;

    // Thuộc tính cho tính năng vuốt
    private currentIndex: number = 0;
    private isDragging: boolean = false;
    private startTouchPos: cc.Vec2 = cc.Vec2.ZERO;
    private lastTouchPos: cc.Vec2 = cc.Vec2.ZERO;
    private carPositions: number[] = [0, 700, 1400, 2100];
    private isSwipeGesture: boolean = false;
    private touchStartTime: number = 0;

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        this.initSwipeFeature();
    }

    start() {
        // this.setupCarPositions();
        // this.centerCurrentCar();
        // Gọi lại để đảm bảo touch events được gắn đúng cách
        this.setupCarTouchEvents();
        this.schedule(() => {
            this.currentIndex++;
            if (this.currentIndex >= this.carPositions.length) {
                this.currentIndex = 0;
            }
            this.moveCarsToCenter();
        }, 1.5, cc.macro.REPEAT_FOREVER, 1)
    }

    selectCar() {
        this.listCar.active = false;
        this.video.node.active = true;
        this.hand.active = false;
        this.video.play();
        this.node.off(cc.Node.EventType.TOUCH_START);
        this.node.off(cc.Node.EventType.TOUCH_MOVE);
        this.node.off(cc.Node.EventType.TOUCH_END);
        this.node.off(cc.Node.EventType.TOUCH_CANCEL);
    }

    eventVideo(video, event) {
        if (event == cc.VideoPlayer.EventType.COMPLETED) {
            this.hand.active = false;
            this.handSwipe.active = false
            this.video.node.active = false;
            this.linkToStore.active = true;
            cc.tween(this.endCard).set({ active: true, scale: 0 }).to(0.2, { scale: 1 }).call(() => {
                this.node.getChildByName('logo').active = false;
                this.node.getChildByName('btnDownload').active = false;
            }).start();
        }
    }

    private initSwipeFeature() {
        // Bật touch events cho node chính (cho swipe)
        this.node.on(cc.Node.EventType.TOUCH_START, this.onCarTouchStart, this);
        // this.node.on(cc.Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
        this.node.on(cc.Node.EventType.TOUCH_END, this.onCarTouchEnd, this);
        this.node.on(cc.Node.EventType.TOUCH_CANCEL, this.onCarTouchEnd, this);

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
        this.selectCar();
        // Chỉ xử lý click nếu thời gian touch ngắn và không có swipe gesture
        // if (touchDuration < maxClickDuration && !this.isSwipeGesture) {
        //     this.onCarSelected(carIndex);
        // }
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

        // Di chuyển mượt mà tất cả các node con sử dụng tween
        this.listCar.children.forEach((child, index) => {
            if (index < this.carPositions.length) {
                // Tính toán vị trí mới dựa trên index hiện tại
                const targetX = child.x - 700;

                // Sử dụng cc.tween để tạo hiệu ứng di chuyển mượt mà
                cc.tween(child)
                    .to(0.4, { position: cc.v3(targetX, child.position.y, child.position.z) }, { easing: 'backOut' }).call(() => {
                        if (child.x < -700) {
                            child.x = child.x * -1;
                        }
                    })
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
    }
}
