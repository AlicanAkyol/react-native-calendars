import React, {useEffect, useRef, useState} from 'react';
import {Text, ScrollView} from 'react-native';
import {CalendarProvider as BeforeProvider, ExpandableCalendar as Before} from './calendarsBefore/src';
import {CalendarProvider as AfterProvider, ExpandableCalendar as After} from './calendarsAfter/src';

type CalendarRef = {toggleCalendarPosition: () => boolean};
const results: Record<string, boolean[]> = {};
export default function App() {
  const before = useRef<CalendarRef>(null);
  const after = useRef<CalendarRef>(null);
  const [phase, setPhase] = useState('rapid');
  const [summary, setSummary] = useState('Running native animations…');
  useEffect(() => {
    results[phase + '-Before'] = [];
    results[phase + '-After'] = [];
    const run = setTimeout(() => {
      const count = phase === 'rapid' ? 3 : 1;
      for (let i = 0; i < count; i++) before.current?.toggleCalendarPosition();
      for (let i = 0; i < count; i++) after.current?.toggleCalendarPosition();
    }, 1000);
    const read = setTimeout(() => {
      setSummary(Object.entries(results).map(([key, values]) => `${key}: ${JSON.stringify(values)}`).join('\n'));
      console.log('CALENDAR_NATIVE_RESULT ' + JSON.stringify(results));
    }, 4200);
    const next = phase === 'rapid' ? setTimeout(() => setPhase('reentrant'), 5500) : undefined;
    return () => {clearTimeout(run); clearTimeout(read); if (next) clearTimeout(next);};
  }, [phase]);
  const notify = (label: string, ref: React.RefObject<CalendarRef | null>) => (open: boolean) => {
    const values = results[phase + '-' + label];
    values.push(open);
    if (phase === 'reentrant' && values.length === 1) ref.current?.toggleCalendarPosition();
  };
  return (
    <ScrollView style={{flex: 1, backgroundColor: 'white'}} contentContainerStyle={{paddingTop: 65, paddingHorizontal: 12}}>
      <Text style={{fontSize: 19, fontWeight: '700'}}>ExpandableCalendar · RN 0.87.1</Text>
      <Text style={{marginVertical: 6}}>{phase === 'rapid' ? 'Three rapid toggles per calendar' : 'Toggle again in the completion callback'}</Text>
      <Text style={{fontSize: 17, fontWeight: '600'}}>Before: upstream master</Text>
      <BeforeProvider key={'Before-' + phase} date="2026-10-27" showTodayButton={false}>
        <Before ref={before} allowShadow={false} onCalendarToggled={notify('Before', before)} />
      </BeforeProvider>
      <Text style={{fontSize: 17, fontWeight: '600', marginTop: 18}}>After: animation lifecycle fix</Text>
      <AfterProvider key={'After-' + phase} date="2026-10-27" showTodayButton={false}>
        <After ref={after} allowShadow={false} onCalendarToggled={notify('After', after)} />
      </AfterProvider>
      <Text style={{fontFamily: 'Menlo', fontSize: 13, marginTop: 18}}>{summary}</Text>
    </ScrollView>
  );
}
