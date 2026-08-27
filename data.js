/* ============================================================
   EDITABLE TRAINING DATA
   Claude or another coding agent can safely update this file.
   Change peakKg values (max weight for 3 reps) without touching app.js.
   Dumbbell peak weights are per hand unless noted otherwise.
   ============================================================ */
window.STRENGTH_DATA = {
  profile: { name: 'Ozgur', age: 53, bodyweightKg: 77, heightCm: 173, bodyFat: '~15%' },
  equipment: [
    { id: 'free', label: 'Weights' },
    { id: 'cable', label: 'Cable' },
    { id: 'machine', label: 'Machine' }
  ],
  bodyParts: [
    { id: 'legs', label: 'Legs' }, { id: 'back', label: 'Back' },
    { id: 'chest', label: 'Chest' }, { id: 'arms', label: 'Arms' },
    { id: 'shoulders', label: 'Shoulders' }
  ],
  exercises: [
    ['free','legs','Goblet Squat',30,'3 × 12–15'],['free','legs','Romanian Deadlift',30,'3 × 12'],['free','legs','Reverse Lunge',24,'3 × 10–12 / side'],['free','legs','Bulgarian Split Squat',22,'3 × 10 / side'],['free','legs','Dumbbell Calf Raise',20,'2 × 12–20'],
    ['free','back','Bent-Over Row',28,'3 × 12'],['free','back','One-Arm Dumbbell Row',32,'3 × 12 / side'],
    ['free','chest','Bench Press',100,'3 × 6–10'],['free','chest','Incline Dumbbell Press',30,'3 × 10–15'],['free','chest','Dumbbell Chest Fly',8,'2 × 12–15'],
    ['free','arms','Dumbbell Biceps Curl',12,'3 × 10–12'],['free','arms','Hammer Curl',14,'3 × 10–12'],['free','arms','Overhead Triceps Extension',18,'3 × 10–12'],['free','arms','Wrist Curl',12,'2 × 15'],
    ['free','shoulders','Dumbbell Shoulder Press',26,'3 × 10–12'],['free','shoulders','Lateral Raise',10,'2 × 12–15'],['free','shoulders','Rear-Delt Raise',8,'3 × 15'],['free','shoulders','External Rotation',6,'2 × 15 / side'],
    ['cable','legs','Cable Romanian Deadlift',35,'3 × 12'],['cable','legs','Cable Pull-Through',35,'3 × 12'],
    ['cable','back','Lat Pulldown',60,'3 × 8–12'],['cable','back','Seated Cable Row',55,'3 × 12'],['cable','back','One-Arm Cable Row',34,'3 × 12 / side'],['cable','back','Face Pull',15,'3 × 15'],
    ['cable','chest','Cable Chest Fly',9,'2 × 12–15'],['cable','chest','Cable Press',25,'3 × 10–15'],
    ['cable','arms','Cable Biceps Curl',18,'3 × 10–12'],['cable','arms','Triceps Pushdown',25,'3 × 10–12'],
    ['cable','shoulders','Cable Lateral Raise',8,'2 × 12–15'],['cable','shoulders','Cable External Rotation',7,'2 × 15 / side'],['cable','shoulders','Cable Woodchopper',12,'2 × 12 / side'],
    ['machine','legs','Leg Press',110,'3 × 12–15'],['machine','legs','Leg Extension',45,'3 × 12–15'],['machine','legs','Seated Leg Curl',45,'3 × 12'],['machine','legs','Calf Raise',90,'2 × 12–20'],
    ['machine','back','Machine Row',65,'3 × 12'],['machine','back','Lat Pulldown (Machine)',60,'3 × 8–12'],['machine','back','Assisted Pull-Up',40,'3 × 8–12'],
    ['machine','chest','Chest Press',75,'3 × 10–15'],['machine','chest','Pec Deck',35,'2 × 12–15'],
    ['machine','arms','Biceps Curl (Machine)',25,'3 × 10–12'],['machine','arms','Triceps Extension (Machine)',30,'3 × 10–12'],
    ['machine','shoulders','Shoulder Press (Machine)',55,'3 × 10–12'],['machine','shoulders','Lateral Raise (Machine)',25,'2 × 12–15'],['machine','shoulders','Rear-Delt (Machine)',25,'3 × 15']
  ].map(([equipment, bodyPart, name, peakKg, target]) => ({
    id: `${equipment}_${bodyPart}_${name.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')}`,
    equipment, bodyPart, name, peakKg, target
  }))
};
