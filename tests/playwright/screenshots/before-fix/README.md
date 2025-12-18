# Video Playback Issue Documentation

## Overview
This document captures the current state of video playback functionality in the NEO-FIT fitness application before implementing fixes. The investigation reveals multiple issues preventing videos from playing properly.

## Screenshots Captured

### 1. 01-main-dashboard.png
- **Location**: Main application dashboard
- **Observation**: App loads successfully with navigation to Coach section available

### 2. 02-coach-library-view.png
- **Location**: Coach -> Library view showing exercise list
- **Observation**: Exercise library displays 7 exercises, with only YouTube Test showing video content

### 3. 03-youtube-test-modal-before-play.png
- **Location**: Exercise detail modal for YouTube Test
- **Observation**: YouTube iframe is properly embedded with play button visible, but video appears paused/not playing

### 4. 04-coach-library-youtube-test-only.png
- **Location**: Coach Library overview
- **Observation**: Only the YouTube Test exercise displays video content in the exercise cards

### 5. 06-youtube-modal-after-play-command.png
- **Location**: YouTube Test modal after attempting to trigger playback via JavaScript API
- **Observation**: Despite sending play commands to YouTube iframe, video still appears not playing visually

### 6. 07-regular-exercises-no-videos.png
- **Location**: Regular exercise cards (Barbell Squat, Bench Press, etc.)
- **Observation**: Exercise cards show placeholder images instead of video content

### 7. 08-barbell-squat-missing-video.png
- **Location**: Barbell Squat exercise detail modal
- **Observation**: Shows "Limited Data Available" and "This exercise is missing: video" message

### 8. 09-bench-press-missing-video.png
- **Location**: Bench Press exercise detail modal
- **Observation**: Same missing video message as Barbell Squat

## Key Findings

### Root Cause Analysis

1. **Empty Video URLs**: All main exercises have empty video strings in `data/exercises.ts`
   - Lines 35-39: SQUAT, BENCH, DEADLIFT, PULLUP, RUN all set to empty strings
   - Only YouTube Test has actual video URL: `https://www.youtube.com/watch?v=wm47Swzn_98`

2. **YouTube Embedding Issues**: Even for the YouTube Test video:
   - Video loads in iframe but doesn't automatically play
   - JavaScript API play commands sent successfully but no visual playback
   - May need user interaction for autoplay policies

3. **UI/UX Issues**:
   - Exercise modals show "Limited Data Available" for missing videos
   - Video player controls appear but are non-functional without content
   - No fallback content or placeholders for missing videos

### Technical Issues Identified

1. **Video Data Structure**: Exercises have `video` property but it's empty for most content
2. **YouTube Integration**: YouTube embed works but playback control needs refinement
3. **Error Handling**: Graceful handling of missing video content needs improvement
4. **User Experience**: Clear indication of video availability vs. missing content

## Scope of the Problem

- **Affected Exercises**: 6 out of 7 exercises (Barbell Squat, Bench Press, Deadlift, Pull Up, Overhead Press, Dumbbell Row)
- **Only Working Video**: YouTube Test (which is for testing purposes)
- **User Impact**: Users cannot view exercise demonstration videos for main exercises

## Next Steps for Fixes

1. **Restore Video URLs**: Update `data/exercises.ts` with working video URLs
2. **Improve YouTube Integration**: Fix autoplay and playback controls for YouTube embeds
3. **Better Error Handling**: Improve UI for missing/ unavailable video content
4. **Video Format Support**: Consider supporting multiple video formats and sources

## Files Involved

- `data/exercises.ts` - Contains exercise data with empty video URLs
- `components/VideoPreview.tsx` - Handles video rendering and playback
- `components/ExerciseDetailModal.tsx` - Shows exercise details and video content
- `views/Coach.tsx` - Displays exercise library

This documentation serves as baseline evidence of the video playback issues that need to be addressed.