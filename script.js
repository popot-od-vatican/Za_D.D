
const StartMenu = document.getElementById("Menu");
const StartMenuButton = document.getElementById("Start-Button");
const EndMenu = document.getElementById("End-Menu");
const PlayAgainButton = document.getElementById("Play-Again-Button");
const LevelLabel = document.getElementById("Level-Label");
const Overlay = document.getElementById("Overlay");
const CANVAS_ELEMENT = document.getElementById("MainWindow");
const ctx = CANVAS_ELEMENT.getContext("2d");
const MAX_TRIANGLES = 5;
const STARTING_TRIANGLES_COUNT = 3;
let CANVAS_WIDTH = 0;
let CANVAS_HEIGHT = 0;
let LastTime = 0;
let TriangleCount = STARTING_TRIANGLES_COUNT;
let GAME_IS_RUNNING = false;
let MainCharacter = null;
let Difficulty = 3;
let Level = 0;
let Triangles = [];
let LastTriangleAlive = 0;
const TRIANGLE_WIDTH = 60;
const TRIANGLE_HEIGHT = 85;
const TRIANGLE_ROTATION_SPEED = 30;
const TRIANGLE_SEARCHING_COLOR = '#10F005';
const TRIANGLE_LOCKED_IN_COLOR = '#CF1111';


function ResizeCanvas(event) {
    CANVAS_WIDTH = CANVAS_ELEMENT.width = window.innerWidth;
    CANVAS_HEIGHT = CANVAS_ELEMENT.height = window.innerHeight;
}

window.addEventListener('resize', ResizeCanvas, false);
StartMenuButton.addEventListener('click', StartGame);
PlayAgainButton.addEventListener('click', StartGame);

function ClearBackground(BackgroundColor = 'black') {
    ctx.fillStyle = BackgroundColor;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
}

function GetRandomValue(max, min) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function CalculateDistance(PointA, PointB) {
    return Math.sqrt(Math.pow(PointB.x - PointA.x, 2) + Math.pow(PointB.y - PointA.y, 2));
}

class InputHandler {

    constructor() {
        document.addEventListener('keydown', this.HandleKeyPressDown.bind(this));
        document.addEventListener('keyup', this.HandleKeyPressUp.bind(this));
        this.XKeyPress = 0;
        this.YKeyPress = 0;
    }

    HandleKeyPressDown(event) {
        switch(event.key) {
            case 'ArrowLeft':
                this.XKeyPress = -1;
                break;
            case 'ArrowRight':
                this.XKeyPress = 1;
                break;
            case 'ArrowDown':
                this.YKeyPress = 1;
                break;
            case 'ArrowUp':
                this.YKeyPress = -1;
                break;
            default:
                break;
        }
    }

    HandleKeyPressUp(event) {
        switch(event.key) {
            case 'ArrowLeft':
                this.XKeyPress = 0;
                break;
            case 'ArrowRight':
                this.XKeyPress = 0;
                break;
            case 'ArrowDown':
                this.YKeyPress = 0;
                break;
            case 'ArrowUp':
                this.YKeyPress = 0;
                break;
            default:
                break;
        }
    }
}

class Circle {
    constructor(context, color, radius, start_x_pos, start_y_pos, baseSpeed = 35) {
        this.context = context;
        this.color = color;
        this.radius = radius;
        this.x_pos = start_x_pos;
        this.y_pos = start_y_pos;
        this.baseSpeed = baseSpeed;
        this.prev_dirx = 0;
        this.prev_diry = 0;
        this.max_x_acc = 550;
        this.max_y_acc = 550;
        this.x_acc_step = 150;
        this.y_acc_step = 150;
        this.dec_x_step = 225;
        this.dec_y_step = 225;
        this.take_acc_from_other_axis_cof = 2;
        this.x_acc = 0;
        this.y_acc = 0;
        this.InputHandler = new InputHandler();
    }

    update(delta) {

        if(GAME_IS_RUNNING) {
            if(this.InputHandler.XKeyPress == -1 && (this.prev_dirx == -1 || this.prev_dirx == 0)) {
                if(this.y_acc != 0 && this.x_acc == 0) this.x_acc = this.y_acc / this.take_acc_from_other_axis_cof;
                else if(this.x_acc == 0) this.x_acc = this.baseSpeed;
                this.x_pos -= this.x_acc * delta;
                this.prev_dirx = this.InputHandler.XKeyPress;
                this.x_acc += (this.x_acc_step * delta);
            }
            else if(this.InputHandler.XKeyPress == 1 && (this.prev_dirx == 1 || this.prev_dirx == 0)) {
                if(this.y_acc != 0 && this.x_acc == 0) this.x_acc = this.y_acc / this.take_acc_from_other_axis_cof;
                else if(this.x_acc == 0) this.x_acc = this.baseSpeed;
                this.x_pos += (this.x_acc * delta);
                this.prev_dirx = this.InputHandler.XKeyPress;
                this.x_acc += (this.x_acc_step * delta);
            }
            else if(this.x_acc != 0) {
                this.x_pos += this.prev_dirx*(this.x_acc * delta);
                this.x_acc -= (this.dec_x_step)*delta;
            }

            if(this.x_acc > this.max_x_acc) {
                this.x_acc = this.max_x_acc;
            }
            else if(this.x_acc < 0) {
                this.x_acc = 0;
                this.prev_dirx = 0;
            }

            if(this.InputHandler.YKeyPress == -1 && (this.prev_diry == -1 || this.prev_diry == 0)) {
                if(this.x_acc != 0 && this.y_acc == 0) this.y_acc = this.x_acc / this.take_acc_from_other_axis_cof;
                else if(this.y_acc == 0) this.y_acc = this.baseSpeed;
                this.y_pos -= this.y_acc * delta;
                this.prev_diry = this.InputHandler.YKeyPress;
                this.y_acc += (this.y_acc_step * delta);
            }
            else if(this.InputHandler.YKeyPress == 1 && (this.prev_diry == 1 || this.prev_diry == 0)) {
                if(this.x_acc != 0 && this.y_acc == 0) this.y_acc = this.x_acc / this.take_acc_from_other_axis_cof;
                else if(this.y_acc == 0) this.y_acc = this.baseSpeed;
                this.y_pos += (this.y_acc * delta);
                this.prev_diry = this.InputHandler.YKeyPress;
                this.y_acc += (this.y_acc_step * delta);
            }
            else if(this.y_acc != 0) {
                this.y_pos += this.prev_diry*(this.y_acc * delta);
                this.y_acc -= (this.dec_y_step)*delta;
            }

            if(this.y_acc > this.max_y_acc) {
                this.y_acc = this.max_y_acc;
            }
            else if(this.y_acc < 0) {
                this.y_acc = 0;
                this.prev_diry = 0;
            }

            if(this.x_pos - this.radius < 0) {
                this.x_pos = this.radius;
                this.prev_dirx = 1;
            }
            else if(this.x_pos + this.radius > CANVAS_WIDTH) {
                this.x_pos = CANVAS_WIDTH - this.radius;
                this.prev_dirx = -1;
            }

            if(this.y_pos - this.radius < 0) {
                this.y_pos = this.radius;
                this.prev_diry = 1;
            }
            else if(this.y_pos + this.radius > CANVAS_HEIGHT) {
                this.y_pos = CANVAS_HEIGHT - this.radius;
                this.prev_diry = -1;
            }
        }
    }

    render() {
        this.context.beginPath();
        this.context.fillStyle = this.color;
        this.context.arc(this.x_pos, this.y_pos, this.radius, 0, 2 * Math.PI);
        this.context.fill();
    }
}

class Triangle {
    constructor(context, width, height, start_x_pos, start_y_pos, rotation_dir = 1, rotation_speed = 10, searching_color, locked_in_color) {
        this.context = context;
        this.width = width;
        this.height = height;
        this.x_pos = start_x_pos;
        this.y_pos = start_y_pos;
        this.rotation_dir = rotation_dir;
        this.rotation_speed = rotation_speed * Math.PI/180;
        this.angle = 0;
        this.LOCKED_IN = false;
        this.DETECTION_HITBOX_PRECISION = 0.5;
        this.searching_color = searching_color;
        this.locked_in_color = locked_in_color;
        this.RayDirectionVector = {};
        this.PrevDirection = {};
        this.show_laser = true;
        this.baseSpeed = 30;
        this.velocity = 0;
        this.velocity_step_inc = 240;
        this.velocity_step_dec = 110;
        this.is_alive = true;
        this.rects = [];
        this.rects_opacity_dec = 0.5;
        this.rects_opacity = 1;
        this.spawning_animation = true;
        this.spawning_animation_speed = 0.7;
        this.spawning_animation_progress = 0;
    }

    LineIntersectsCircle(CirclePos, CircleRadius, PointA, PointB) {
        const AP_X = CirclePos.x - PointA.x;
        const AP_Y = CirclePos.y - PointA.y;
        const AB_X = PointB.x - PointA.x;
        const AB_Y = PointB.y - PointA.y;

        const AB_AB = AB_X * AB_X + AB_Y * AB_Y;
        const AB_AP = AB_X * AP_X + AB_Y * AP_Y;

        const T = Math.max(0, Math.min(1, AB_AP / AB_AB));

        const ClosestX = PointA.x + T * AB_X;
        const ClosestY = PointA.y + T * AB_Y;

        const ClosestDist = (CirclePos.x - ClosestX) * (CirclePos.x - ClosestX) + (CirclePos.y - ClosestY) * (CirclePos.y - ClosestY);
        
        return (ClosestDist <= CircleRadius * CircleRadius) ? true : false;
    }

    update(delta, targetCircle) {

        if(this.is_alive && GAME_IS_RUNNING && !this.spawning_animation) {
            if(!this.LOCKED_IN && this.velocity == 0) this.angle += this.rotation_speed*delta;

            if(!this.LOCKED_IN && this.velocity != 0) {

                this.x_pos += this.PrevDirection.x * this.velocity * delta;
                this.y_pos += this.PrevDirection.y * this.velocity * delta;

                this.velocity = this.velocity - this.velocity_step_dec * delta;
                if(this.velocity < 0) this.velocity = 0;
            }

            const NewX = -Math.sin(this.angle * this.rotation_dir) * (this.y_pos-this.height/2 - this.y_pos) + this.x_pos;
            const NewY = Math.cos(this.angle * this.rotation_dir) * (this.y_pos-this.height/2 - this.y_pos) + this.y_pos;

            this.RayDirectionVector = {x: NewX - this.x_pos, y: NewY - this.y_pos};

            const Magnitude = Math.sqrt(this.RayDirectionVector.x * this.RayDirectionVector.x + this.RayDirectionVector.y * this.RayDirectionVector.y);
            const NormalizedRayDirectionVector = { x: this.RayDirectionVector.x / Magnitude, y: this.RayDirectionVector.y / Magnitude };

            const Diff = { x: targetCircle.x_pos - this.x_pos, y: targetCircle.y_pos - this.y_pos };

            const DotProduct = Diff.x * NormalizedRayDirectionVector.x + Diff.y * NormalizedRayDirectionVector.y;

            if (DotProduct > 0) {
                const A = this.RayDirectionVector.x * this.RayDirectionVector.x + this.RayDirectionVector.y * this.RayDirectionVector.y;
                const B = 2 * (this.RayDirectionVector.x * Diff.x + this.RayDirectionVector.y * Diff.y);
                const C = Diff.x * Diff.x + Diff.y * Diff.y - (targetCircle.radius * this.DETECTION_HITBOX_PRECISION * targetCircle.radius * this.DETECTION_HITBOX_PRECISION);

                if (B * B - 4 * A * C >= 0) {
                    this.LOCKED_IN = true;
                    this.PrevDirection = NormalizedRayDirectionVector;
                    if(this.velocity == 0) this.velocity = this.baseSpeed;
                    this.x_pos += this.PrevDirection.x * this.velocity * delta;
                    this.y_pos += this.PrevDirection.y * this.velocity * delta;
                    this.velocity = this.velocity + this.velocity_step_inc * delta;
                }
                else {
                    this.LOCKED_IN = false;
                }
            }
            else {
                this.LOCKED_IN = false;
            }

            const PointA = {x: NewX, y: NewY};
            const PointB = {
                x: Math.cos(this.rotation_dir * this.angle) * (-this.width/2) - Math.sin(this.rotation_dir * this.angle) * (this.height/2) + this.x_pos,
                y: Math.sin(this.rotation_dir * this.angle) * (-this.width/2) + Math.cos(this.rotation_dir * this.angle) * (this.height/2) + this.y_pos
            };
            const PointC = {
                x: Math.cos(this.rotation_dir * this.angle) * (this.width/2) - Math.sin(this.rotation_dir * this.angle) * (this.height/2) + this.x_pos,
                y: Math.sin(this.rotation_dir * this.angle) * (this.width/2) + Math.cos(this.rotation_dir * this.angle) * (this.height/2) + this.y_pos
            };

            const CirclePos = {x: targetCircle.x_pos, y: targetCircle.y_pos};
            const ClosestPointOnTriangleToCircle = Math.min(
                CalculateDistance(PointA, CirclePos),
                CalculateDistance(PointB, CirclePos),
                CalculateDistance(PointC, CirclePos)
            );
            

            // CAUGHT
            if(ClosestPointOnTriangleToCircle <= targetCircle.radius
                || this.LineIntersectsCircle(CirclePos, targetCircle.radius, PointA, PointB)
                || this.LineIntersectsCircle(CirclePos, targetCircle.radius, PointA, PointC)
                || this.LineIntersectsCircle(CirclePos, targetCircle.radius, PointB, PointC)) {
                GAME_IS_RUNNING = false;
            }

            if(PointA.x < 0 || PointA.x > CANVAS_WIDTH || PointA.y < 0 || PointA.y > CANVAS_HEIGHT) {
                this.is_alive = false;
                --TriangleCount;
            }
            else if(PointB.x < 0 || PointB.x > CANVAS_WIDTH || PointB.y < 0 || PointB.y > CANVAS_HEIGHT) {
                this.is_alive = false;
                --TriangleCount;
            }
            else if(PointC.x < 0 || PointC.x > CANVAS_WIDTH || PointC.y < 0 || PointC.y > CANVAS_HEIGHT) {
                this.is_alive = false;
                --TriangleCount;
            }

            if(this.show_laser) {
                this.context.beginPath();
                this.context.moveTo(NewX, NewY);
                this.context.lineTo(NewX + this.RayDirectionVector.x * 100, NewY + this.RayDirectionVector.y * 100);
                this.context.strokeStyle = "aqua";
                this.context.stroke();
            }
        }
        else if(!this.is_alive) {

            if(this.rects.length == 0) {
                this.rects.push({
                    x: this.x_pos + GetRandomValue(10, 0), y: this.y_pos + GetRandomValue(10, 0), width: GetRandomValue(30, 10), height: GetRandomValue(30, 10)
                });
                this.rects.push({
                    x: this.x_pos + GetRandomValue(40, 5), y: this.y_pos + GetRandomValue(40, 5), width: GetRandomValue(30, 10), height: GetRandomValue(30, 10)
                });
                this.rects.push({
                    x: this.x_pos - GetRandomValue(40, 5), y: this.y_pos - GetRandomValue(40, 5), width: GetRandomValue(30, 10), height: GetRandomValue(30, 10)
                });
                this.rects.push({
                    x: this.x_pos + GetRandomValue(40, 5), y: this.y_pos - GetRandomValue(40, 5), width: GetRandomValue(30, 10), height: GetRandomValue(30, 10)
                });
                this.rects.push({
                    x: this.x_pos - GetRandomValue(40, 5), y: this.y_pos + GetRandomValue(40, 5), width: GetRandomValue(30, 10), height: GetRandomValue(30, 10)
                });
                this.rects.push({
                    x: this.x_pos - GetRandomValue(10, 5), y: this.y_pos - GetRandomValue(10, 5), width: GetRandomValue(30, 10), height: GetRandomValue(30, 10)
                });
                this.rects.push({
                    x: this.x_pos - GetRandomValue(25, 20), y: this.y_pos - GetRandomValue(25, 20), width: GetRandomValue(20, 10), height: GetRandomValue(20, 10)
                });
            }

            if(this.rects_opacity != 0) {
                this.rects_opacity = this.rects_opacity - this.rects_opacity_dec * delta;
                if(this.rects_opacity < 0) this.rects_opacity = 0;
            }
        }
        else {
            if(this.spawning_animation_progress >= 1.0) {
                this.spawning_animation = false;
            }
            this.spawning_animation_progress += this.spawning_animation_speed * delta;
        }
    }

    render() {
        if(this.is_alive && !this.spawning_animation) {
            this.context.beginPath();
            this.context.translate(this.x_pos, this.y_pos);
            this.context.rotate(this.rotation_dir*this.angle);
            this.context.moveTo(0, -this.height/2);
            this.context.lineTo(-this.width/2, this.height/2);
            this.context.lineTo(this.width/2, this.height/2) ;
            this.context.closePath();
            this.context.fillStyle = (!this.LOCKED_IN) ? this.searching_color : this.locked_in_color;
            this.context.fill();
            this.context.resetTransform();
        }
        else if(!this.is_alive && !this.spawning_animation) {
            this.context.fillStyle = (!this.LOCKED_IN) ? this.searching_color : this.locked_in_color;
            this.context.globalAlpha = this.rects_opacity;

            for(let i = 0; i < this.rects.length; ++i) {
                this.context.fillRect(this.rects[i].x, this.rects[i].y, this.rects[i].width, this.rects[i].height)
            }

            this.context.globalAlpha = 1;
        }
        else {
            this.context.beginPath();
            //this.context.scale(this.spawning_animation_progress, this.spawning_animation_progress);
            this.context.translate(this.x_pos, this.y_pos);
            this.context.scale(this.spawning_animation_progress, this.spawning_animation_progress);
            this.context.rotate(this.rotation_dir*this.angle);
            this.context.moveTo(0, 0 - this.height/2);
            this.context.lineTo(0 - this.width/2, 0 + this.height/2);
            this.context.lineTo(0 + this.width/2, 0 + this.height/2) ;
            this.context.closePath();
            this.context.fillStyle = 'orange';
            this.context.fill();
            this.context.resetTransform();
        }
    }
}

function PointNotToClose(Point, Objects, Tolerance) {
    let valid = true;

    for(let i = 0; i < Objects.length; ++i) {
        if(CalculateDistance(Point, {x: Objects[i].x_pos, y: Objects[i].y_pos}) < Tolerance) {
            valid = false;
            break;
        }
    }

    return valid;
}

function GenerateNewTriangles(count) {

    const MAX_WIDTH_HEIGHT = Math.max(TRIANGLE_HEIGHT, TRIANGLE_WIDTH);

    for(let i = 0; i < count; ++i) {

        let x_pos;
        let y_pos;

        do {
            x_pos = GetRandomValue(CANVAS_WIDTH - MAX_WIDTH_HEIGHT, MAX_WIDTH_HEIGHT);
            y_pos = GetRandomValue(CANVAS_HEIGHT - MAX_WIDTH_HEIGHT, MAX_WIDTH_HEIGHT);
        } while(!PointNotToClose({x: x_pos, y: y_pos}, [...Triangles, MainCharacter], 150));

        Triangles.push(new Triangle(ctx, TRIANGLE_WIDTH, TRIANGLE_HEIGHT,
            x_pos, 
            y_pos,
            (Math.random() < 0.5) ? 1 : -1,
            TRIANGLE_ROTATION_SPEED,
            TRIANGLE_SEARCHING_COLOR,
            TRIANGLE_LOCKED_IN_COLOR
        ));
        Triangles[i].angle = GetRandomValue(2 * Math.PI, 0);
    }
}

function InitializeObjects() {
    MainCharacter = new Circle(ctx, "white", 28, CANVAS_WIDTH/2 - 14, CANVAS_HEIGHT/2 - 14);
    GenerateNewTriangles(3);
}

function RenderTriangles(delta) {
    for(let i = 0; i < Triangles.length; ++i) {
        Triangles[i].render(delta);
    }
}

function UpdateTriangles(delta, targetCircle) {
    for(let i = 0; i < Triangles.length; ++i) {
        Triangles[i].update(delta, targetCircle);
        if(Triangles[i].is_alive) {
            LastTriangleAlive = Triangles[i];
        }
    }
}

function Loop(TimeElapsed) {
    if(LastTime == 0 && TimeElapsed != 0) {
        LastTime = TimeElapsed;
    }
    const DeltaTime = (TimeElapsed - LastTime) / 1000;
    LastTime = TimeElapsed;

    ClearBackground();

    MainCharacter.render();
    RenderTriangles(DeltaTime);

    MainCharacter.update(DeltaTime);
    UpdateTriangles(DeltaTime, MainCharacter);

    if(TriangleCount == 0) {
        Triangles = [LastTriangleAlive, ];
        ++Level;
        TriangleCount = ++Difficulty;
        GenerateNewTriangles(TriangleCount);
    }
    
    if(!GAME_IS_RUNNING) {
        EndMenu.style.display = 'flex';
        Overlay.style.display = 'block';
        LevelLabel.innerHTML = `Level: ${Level}`;
        LastTime = 0;
        return;
    }

    requestAnimationFrame(Loop);
}

function StartGame() {
    StartMenu.style.display = 'none';
    EndMenu.style.display = 'none';
    Overlay.style.display = 'none';

    GAME_IS_RUNNING = true;
    TriangleCount = 3;
    Triangles = [];
    Level = 1;
    Difficulty = 3;

    ResizeCanvas();
    InitializeObjects();
    Loop(0);
}
