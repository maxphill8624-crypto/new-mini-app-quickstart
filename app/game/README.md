# Endless Runner Game

A fun, mobile-friendly endless runner game built with HTML5 Canvas and React.

## Features

### Core Gameplay
- **Three-Lane System**: Player can move between left, center, and right lanes
- **Jump Mechanics**: Tap to jump over obstacles
- **Dodge System**: Swipe left/right to change lanes and avoid obstacles
- **Collectibles**: Collect golden coins for bonus points
- **Progressive Difficulty**: Game speed increases as your score grows
- **Collision Detection**: Accurate hit detection for obstacles and collectibles

### Game Modes
- **Menu Screen**: Start screen with high score display and sound toggle
- **Playing**: Active gameplay with real-time score display
- **Game Over**: Results screen showing final score, high score, and restart option

### Visual Features
- **Parallax Scrolling**: Three-layer background for depth effect
- **Smooth Animations**: 60fps gameplay using requestAnimationFrame
- **Responsive Design**: Automatically scales to any screen size
- **Clean Graphics**: Colorful geometric shapes with gradients and highlights

### Audio
- **Jump Sound**: Pleasant tone when jumping
- **Collection Sound**: Higher pitched tone when collecting coins
- **Collision Sound**: Lower crash sound on game over
- **Sound Toggle**: Option to enable/disable all sound effects

### Controls

#### Mobile
- **Tap**: Jump
- **Swipe Up**: Jump
- **Swipe Left**: Move to left lane
- **Swipe Right**: Move to right lane
- **On-Screen Buttons**: Visual controls for testing

#### Desktop
- **Space/Up Arrow**: Jump
- **Left Arrow**: Move to left lane
- **Right Arrow**: Move to right lane
- **Click**: Jump

### Technical Details

#### Technologies
- React 19 with TypeScript
- HTML5 Canvas API
- Web Audio API
- LocalStorage for high score persistence

#### Performance
- Optimized game loop using requestAnimationFrame
- Efficient object pooling for obstacles and coins
- Smooth 60fps rendering
- Touch event handling with gesture recognition

#### Mobile Optimizations
- Prevent scrolling and default touch behaviors
- Responsive canvas sizing
- Touch-optimized controls
- Landscape mode support

## How to Play

1. Navigate to `/game` route
2. Click/tap "Start Game" from the menu
3. Tap to jump or swipe to dodge obstacles
4. Collect golden coins for extra points
5. Survive as long as possible - the game gets faster!
6. Try to beat your high score!

## Scoring

- **Time Survived**: +0.1 points per frame
- **Coins Collected**: +10 points per coin
- **High Score**: Automatically saved to browser localStorage

## Game Objects

### Player
- Blue square character with animated face
- Size: 40x40 pixels
- Responsive to gravity and jump mechanics

### Obstacles
- Red rectangular barriers
- Variable heights (30-80 pixels)
- Spawn in random lanes
- Speed increases with player score

### Coins
- Golden circular collectibles
- Size: 20x20 pixels
- Spawn at varying heights
- Add bonus points when collected

## Future Enhancements

Possible additions for future versions:
- Power-ups (invincibility, double points, slow motion)
- Different character skins
- Multiple obstacle types
- Achievements system
- Leaderboard integration
- Music tracks
- Particle effects
- Mobile haptic feedback
