const { ccclass, property } = cc._decorator;
import GamePlay from './game';
const CALC_RECT_WIDTH = 40;
const CLEAR_LINE_WIDTH = 40;

@ccclass
export default class Scratch_ticket extends cc.Component {
  @property(cc.Node)
  maskNode: cc.Node = null;

  @property(cc.Node)
  ticketNode: cc.Node = null;

  progress: number = 0;

  gamePlay: GamePlay = null;

  // Callback for position updates (e.g., to move cleanItem)
  onPositionUpdate: (worldPos: cc.Vec2) => void = null;

  onLoad() {
    this.gamePlay = cc.Canvas.instance.getComponent(GamePlay);
    this.reset();
    this.ticketNode.on(cc.Node.EventType.TOUCH_START, this.touchStartEvent, this);
    this.ticketNode.on(cc.Node.EventType.TOUCH_MOVE, this.touchMoveEvent, this);
    this.ticketNode.on(cc.Node.EventType.TOUCH_END, this.touchEndEvent, this);
    this.ticketNode.on(cc.Node.EventType.TOUCH_CANCEL, this.touchEndEvent, this);
  }

  beforeDestroy() {
    this.ticketNode.off(cc.Node.EventType.TOUCH_START, this.touchStartEvent, this);
    this.ticketNode.off(cc.Node.EventType.TOUCH_MOVE, this.touchMoveEvent, this);
    this.ticketNode.off(cc.Node.EventType.TOUCH_END, this.touchEndEvent, this);
    this.ticketNode.off(cc.Node.EventType.TOUCH_CANCEL, this.touchEndEvent, this);
  }

  touchStartEvent(event) {
    let point = this.ticketNode.convertToNodeSpaceAR(event.getLocation());
    this.clearMask(point);
    if(this.gamePlay.step == 0) {
      this.gamePlay.guideClean.active = false;
      cc.audioEngine.playMusic(this.gamePlay.cleanSound,true);
    }
    if(this.gamePlay.step == 1) {
      this.gamePlay.guidePolishing.active = false;
      cc.audioEngine.playMusic(this.gamePlay.polishingSound,true);
    }
    
    // Call position update callback
    if (this.onPositionUpdate) {
      this.onPositionUpdate(event.getLocation());
    }
  }

  touchMoveEvent(event) {
    let point = this.ticketNode.convertToNodeSpaceAR(event.getLocation());
    this.clearMask(point);

    this.calcProgress();
    
    // Call position update callback
    if (this.onPositionUpdate) {
      this.onPositionUpdate(event.getLocation());
    }
  }

  touchEndEvent() {
    this.tempDrawPoints = [];
    this.calcProgress();
  }

  calcDebugger: boolean = false; // 辅助开关，开启则会绘制划开涂层所属的小格子
  calcProgress() {
    let hitItemCount = 0;
    let ctx = this.ticketNode.getComponent(cc.Graphics);
    this.polygonPointsList.forEach((item) => {
      if (!item.isHit) return;
      hitItemCount += 1;

      if (!this.calcDebugger) return;
      ctx.rect(item.rect.x, item.rect.y, item.rect.width, item.rect.height);
      ctx.fillColor = cc.color(216, 18, 18, 255);
      ctx.fill();
    });

    this.progress = Math.ceil((hitItemCount / this.polygonPointsList.length) * 100);
  }

  tempDrawPoints: cc.Vec2[] = [];
  clearMask(pos) {
    let mask: any = this.maskNode.getComponent(cc.Mask);
    let stencil = mask._graphics;
    const len = this.tempDrawPoints.length;
    this.tempDrawPoints.push(pos);

    if (len <= 1) {
      // 只有一个点，用圆来清除涂层
      stencil.circle(pos.x, pos.y, CLEAR_LINE_WIDTH);
      stencil.fill();

      // 记录点所在的格子
      this.polygonPointsList.forEach((item) => {
        if (item.isHit) return;
        const xFlag = pos.x > item.rect.x && pos.x < item.rect.x + item.rect.width;
        const yFlag = pos.y > item.rect.y && pos.y < item.rect.y + item.rect.height;
        if (xFlag && yFlag) item.isHit = true;
      });
    } else {
      // 存在多个点，用线段来清除涂层
      let prevPos = this.tempDrawPoints[len - 2];
      let curPos = this.tempDrawPoints[len - 1];

      stencil.moveTo(prevPos.x, prevPos.y);
      stencil.lineTo(curPos.x, curPos.y);
      stencil.lineWidth = CLEAR_LINE_WIDTH*2;
      stencil.lineCap = cc.Graphics.LineCap.ROUND;
      stencil.lineJoin = cc.Graphics.LineJoin.ROUND;
      stencil.strokeColor = cc.color(255, 255, 255, 255);
      stencil.stroke();

      // 记录线段经过的格子
      this.polygonPointsList.forEach((item) => {
        item.isHit = item.isHit || cc.Intersection.lineRect(prevPos, curPos, item.rect);
      });
    }
  }

  polygonPointsList: { rect: cc.Rect; isHit: boolean }[] = [];
  reset() {
    let mask: any = this.maskNode.getComponent(cc.Mask);
    mask._graphics.clear();

    this.tempDrawPoints = [];
    this.polygonPointsList = [];
    // this.progerss.string = '已经刮开了 0%';
    this.ticketNode.getComponent(cc.Graphics).clear();

    // 生成小格子，用来辅助统计涂层的刮开比例
    for (let x = 0; x < this.ticketNode.width; x += CALC_RECT_WIDTH) {
      for (let y = 0; y < this.ticketNode.height; y += CALC_RECT_WIDTH) {
        this.polygonPointsList.push({
          rect: cc.rect(x - this.ticketNode.width / 2, y - this.ticketNode.height / 2, CALC_RECT_WIDTH, CALC_RECT_WIDTH),
          isHit: false
        });
      }
    }
  }
}
