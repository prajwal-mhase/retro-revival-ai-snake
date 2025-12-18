# Game Logic Flow – AI Retro Snake

1. Initialize game state and wait for user to start
2. Capture keyboard input for snake movement
3. Update snake position per frame
4. AI analyzes:
   - Player score (performance)
   - Near-miss behavior
   - Proximity to walls
5. AI dynamically:
   - Increases or decreases speed
   - Highlights snake head on danger
6. Detect collisions (food / wall)
7. Update score and high score
8. Render updated game state
9. On game over, pause logic and display overlay
