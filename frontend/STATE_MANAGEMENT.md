# State Management Documentation

This project implements **both Redux and Context API** for managing stage/page state with id and name.

## Overview

The application tracks the current page/stage using two state management solutions:

1. **Context API** - Built-in React solution (no extra dependencies)
2. **Redux** - External state management library (more robust for larger apps)

Both implementations manage the same data structure:
```javascript
{
  id: number,
  name: string
}
```

## Stage Definitions

The application defines three stages:

- **Login Page**: `{ id: 1, name: 'Login Page' }`
- **Registration Page**: `{ id: 2, name: 'Registration Page' }`
- **Home Page**: `{ id: 3, name: 'Home Page' }`

## File Structure

```
frontend/src/
├── context/
│   └── StageContext.js          # Context API implementation
├── redux/
│   ├── store.js                 # Redux store configuration
│   ├── actions/
│   │   └── stageActions.js      # Redux actions
│   └── reducers/
│       └── stageReducer.js      # Redux reducer
└── components/
    └── StageDisplay.js          # Component to display stage info
```

## Usage

### Context API

**Import and use:**
```javascript
import { useStage, STAGES } from '../context/StageContext';

function MyComponent() {
  const { currentStage, updateStage } = useStage();
  
  // Update stage
  updateStage(STAGES.HOME);
  
  // Access current stage
  console.log(currentStage.id);    // 3
  console.log(currentStage.name);  // 'Home Page'
}
```

### Redux

**Import and use:**
```javascript
import { useDispatch, useSelector } from 'react-redux';
import { setStage, STAGES } from '../redux/actions/stageActions';

function MyComponent() {
  const dispatch = useDispatch();
  const currentStage = useSelector(state => state.stage);
  
  // Update stage
  dispatch(setStage(STAGES.HOME));
  
  // Access current stage
  console.log(currentStage.id);    // 3
  console.log(currentStage.name);  // 'Home Page'
}
```

## StageDisplay Component

The `StageDisplay` component shows the current stage information. It supports three modes:

1. **Show both implementations** (default):
```javascript
<StageDisplay showBoth={true} />
```

2. **Show only Context API**:
```javascript
<StageDisplay useRedux={false} />
```

3. **Show only Redux**:
```javascript
<StageDisplay useRedux={true} />
```

## Automatic Stage Updates

All pages automatically update the stage when they mount:

- **LoginPage** → Sets stage to `STAGES.LOGIN`
- **RegistrationPage** → Sets stage to `STAGES.REGISTER`
- **HomePage** → Sets stage to `STAGES.HOME`

## Persistence

- **Context API**: Stage is saved to `localStorage` under key `currentStage`
- **Redux**: State is saved to `localStorage` under key `reduxState`

Both implementations persist state across page refreshes.

## Redux Actions

Available Redux actions:

- `setStage(stage)` - Set stage directly
- `setStageById(id)` - Set stage by ID
- `setStageByName(name)` - Set stage by name
- `resetStage()` - Reset to default (Login Page)

## Context API Methods

Available Context API methods:

- `updateStage(stage)` - Update current stage
- `getStageById(id)` - Get stage by ID
- `getStageByName(name)` - Get stage by name
- `currentStage` - Current stage object
- `STAGES` - All available stages

## Example: Manual Stage Update

```javascript
import { useStage, STAGES } from '../context/StageContext';
import { useDispatch } from 'react-redux';
import { setStage } from '../redux/actions/stageActions';

function MyComponent() {
  const { updateStage } = useStage();
  const dispatch = useDispatch();
  
  const handleNavigate = () => {
    // Update both implementations
    updateStage(STAGES.HOME);
    dispatch(setStage(STAGES.HOME));
    
    // Navigate
    navigate('/home');
  };
  
  return <button onClick={handleNavigate}>Go Home</button>;
}
```

## Notes

- Both implementations are active simultaneously
- Stage updates are synchronized between both systems
- The `StageDisplay` component shows both implementations side by side
- State persists across browser refreshes for both implementations

