"""Analiza los MP3 originales y compone partituras de dos alturas reproducibles.

Los ataques conservan su tiempo medido; la rejilla organiza las frases sin
redondear los ataques. Las fuentes se guardan para revisar o editar los mapas.
"""
from pathlib import Path
import argparse
import hashlib
import json
import math
import numpy as np
import soundfile as sf
import librosa
from scipy.ndimage import median_filter, uniform_filter1d

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'assets/scores'
SR, HOP, FFT = 11025, 64, 512
TRACKS = [
    ('aurora', 'Altale', 'Sakuzyo'),
    ('io', 'Pixel Galaxy', "Snail's House"),
    ('scrap', 'Feral', 'meganeko'),
    ('rebound', 'Cheatreal', 't+pazolite'),
    ('ions', 'Blue Zenith', 'xi'),
    ('chimera', 'crystallized', 'Camellia'),
    ('spin', "Exit This Earth's Atomosphere", 'Camellia'),
    ('zero', 'Halcyon', 'xi'),
]
# Referencias de pulso para resolver medias velocidades y tresillos ambiguos.
# El rastreo local y los ataques siguen procediendo del archivo, sin cuantizar.
PULSE_PRIORS = dict(aurora=90, io=150, scrap=160, rebound=200, ions=200, chimera=174, spin=170, zero=191)

def save(file, data):
    file.parent.mkdir(parents=True, exist_ok=True)
    file.write_text(json.dumps(data, ensure_ascii=False, separators=(',', ':')) + '\n', encoding='utf-8')

def analyze(track, title, artist):
    file = ROOT / f'assets/music/{track}.mp3'
    samples, rate = sf.read(file, dtype='float32', always_2d=True)
    duration = len(samples) / rate
    y = librosa.resample(samples.mean(axis=1), orig_sr=rate, target_sr=SR)
    del samples
    spectrum = np.abs(librosa.stft(y, n_fft=FFT, hop_length=HOP)).astype('float32')
    power = spectrum ** 2
    mel = librosa.feature.melspectrogram(S=power, sr=SR, n_mels=48, fmin=35)
    db = librosa.power_to_db(mel)
    bands = [librosa.onset.onset_strength(S=part, sr=SR, hop_length=HOP, n_fft=FFT, aggregate=np.mean) for part in [db, db[:12], db[28:]]]
    normalized = [band / max(1e-6, float(np.percentile(band[band>0], 85))) for band in bands]
    envelope = normalized[0]*.5 + normalized[1]*.25 + normalized[2]*.25
    frames = librosa.onset.onset_detect(onset_envelope=envelope, sr=SR, hop_length=HOP, units='frames', pre_max=2, post_max=2, pre_avg=18, post_avg=18, delta=.022, wait=4)
    rms = librosa.feature.rms(S=spectrum, frame_length=FFT, hop_length=HOP)[0]
    horizontal = median_filter(spectrum, size=(1, 19))
    vertical = median_filter(spectrum, size=(19, 1))
    harmonic = (power * (horizontal > vertical * 1.3)).sum(axis=0)
    harmonic_ratio = uniform_filter1d(harmonic / (power.sum(axis=0) + 1e-9), size=13)
    hz = librosa.fft_frequencies(sr=SR, n_fft=FFT)
    bass = power[(hz >= 35) & (hz < 300)].sum(axis=0)
    high = power[(hz >= 1400) & (hz < 5000)].sum(axis=0)
    # Microenvolvente de 5.8 ms para localizar el comienzo del ataque, sin
    # desplazar la nota al centro de una ventana espectral.
    blocks = np.pad(y, (0, (-len(y)) % HOP)).reshape(-1, HOP)
    micro = np.sqrt((blocks * blocks).mean(axis=1))
    rise = np.maximum(0, np.diff(np.log1p(micro * 35), prepend=0))
    peaks = []
    strength_scale = max(1e-6, float(np.percentile(envelope[frames], 85))) if len(frames) else 1
    for frame in frames:
        approx = frame * HOP / SR
        a, b = max(0, frame - 8), min(len(rise), frame + 2)
        attack = (a + int(np.argmax(rise[a:b]))) * HOP / SR
        if attack < 2.6 or attack > duration - .8 or rms[frame] < np.max(rms) * .013:
            continue
        start = min(len(rms)-1, frame + int(.12 * SR / HOP))
        tail = start
        base = max(1e-7, float(np.median(rms[frame:min(len(rms), start + 10)])))
        while tail < min(len(rms)-1, frame + int(3.3*SR/HOP)):
            if harmonic_ratio[tail] < .30 or rms[tail] < base * .48:
                break
            tail += 1
        sustain_end = tail * HOP / SR if harmonic_ratio[start] > .42 and tail-start > .5*SR/HOP else attack
        p = dict(time=round(attack, 4), strength=round(float(envelope[frame])/strength_scale, 4), bass=round(float(bass[frame]), 5), high=round(float(high[frame]), 5), sustainEnd=round(min(duration-.5, sustain_end), 4))
        if peaks and p['time']-peaks[-1]['time'] < .035:
            if p['strength'] > peaks[-1]['strength']:
                peaks[-1] = p
        else:
            peaks.append(p)
    # Curva de tempo local a menor resolución: admite rubato y cambios sin
    # fijar un único BPM para toda la canción.
    beat_hop = HOP * 4
    beat_env = envelope[::4]
    prior = PULSE_PRIORS[track]
    global_tempo = float(np.asarray(librosa.feature.tempo(onset_envelope=beat_env, sr=SR, hop_length=beat_hop, start_bpm=prior, std_bpm=.18)).ravel()[0])
    curve = librosa.feature.tempo(onset_envelope=beat_env, sr=SR, hop_length=beat_hop, aggregate=None, ac_size=10, start_bpm=prior, std_bpm=.13)
    curve = np.asarray(curve).ravel()
    curve = np.where(curve < global_tempo*.72, curve*2, curve)
    curve = np.where(curve > global_tempo*1.45, curve/2, curve)
    curve = median_filter(curve, size=81)
    _, beat_frames = librosa.beat.beat_track(onset_envelope=beat_env, sr=SR, hop_length=beat_hop, bpm=curve, tightness=70, trim=True)
    beats = librosa.frames_to_time(beat_frames, sr=SR, hop_length=beat_hop).tolist()
    beats = [round(float(t), 4) for t in beats if 0 <= t < duration]
    if len(beats) < 16:
        raise RuntimeError(f'{track}: no se encontró un pulso suficientemente largo')
    phrases = []
    for i in range(0, len(beats)-8, 8):
        begin, end = beats[i], beats[i+8]
        a,b = int(begin*SR/HOP), int(end*SR/HOP)
        phrases.append(dict(start=begin, end=end, beat=i, energy=round(float(np.mean(rms[a:b])), 5)))
    result = dict(version=1, analysis='spectral-onset+local-tempo-1', id=track, title=title, artist=artist, audio=f'assets/music/{track}.mp3', sha256=hashlib.sha256(file.read_bytes()).hexdigest(), duration=round(duration, 6), sampleRate=rate, estimatedBpm=round(global_tempo, 3), beats=beats, attacks=peaks, phrases=phrases)
    save(OUT/'source'/f'{track}.json', result)
    print(f"ANALIZADO {track}: {duration:.3f}s, {len(peaks)} ataques, pulso base {global_tempo:.2f}, {sum(p['sustainEnd']-p['time']>.6 for p in peaks)} sostenidos candidatos", flush=True)
    return result

def special_sections(source):
    duration, beats, phrases = source['duration'], source['beats'], source['phrases']
    max_energy = max(p['energy'] for p in phrases)
    bosses = []
    for target in ([.37, .72] if duration > 240 else [.65]):
        choices = []
        for p in phrases:
            i = p['beat']
            if i+16 >= len(beats): continue
            start,end = p['start'],beats[i+16]
            if not (duration*.20 < start < duration*.84 and 4.5 <= end-start <= 12 and end < duration-8): continue
            if any(start < old['end']+22 and end > old['time']-22 for old in bosses): continue
            score = p['energy']/max_energy - abs(start/duration-target)*2.5
            choices.append((score,start,end))
        if not choices: raise RuntimeError('No hay sección musical para el guardián')
        _,start,end = max(choices)
        bosses.append(dict(time=round(start,3), end=round(end,3)))
    encounters = []
    for target in [.29, .80]:
        choices = []
        for p in phrases:
            i=p['beat']
            if i+24>=len(beats): continue
            start,end=p['start'],beats[i+24]
            if start<15 or end>duration-8: continue
            if any(start<boss['end']+3 and end>boss['time']-3 for boss in bosses):continue
            if any(start<old['end']+10 and end>old['time']-10 for old in encounters):continue
            score=p['energy']/max_energy-abs(start/duration-target)*3
            choices.append((score,start,end))
        if choices:
            _,start,end=max(choices);encounters.append(dict(time=round(start,3),end=round(end,3)))
    return sorted(bosses,key=lambda s:s['time']), sorted(encounters,key=lambda s:s['time'])

def compose(source, difficulty, sections):
    bosses, encounters = sections
    attacks,beats=source['attacks'],source['beats']
    min_gap={'easy':.33,'normal':.20,'hard':.12}[difficulty]
    energies=[p['energy'] for p in source['phrases']]
    high_energy=float(np.percentile(energies,62))
    notes=[];chosen=set();last=-100
    patterns=['pulso','respuesta','escalera','contratiempo']
    for pi,phrase in enumerate(source['phrases']):
        first=phrase['beat'];intense=phrase['energy']>=high_energy
        pattern=patterns[(pi//2)%len(patterns)]
        for bi in range(8):
            idx=first+bi
            if idx+1>=len(beats):break
            length=beats[idx+1]-beats[idx]
            division=1 if difficulty=='easy' else 2 if difficulty=='hard' or (intense and pi%3!=0) else 1
            if difficulty=='hard' and intense and pi%4==3 and bi>=6:division=4
            for sub in range(division):
                if difficulty=='easy' and bi in ([1,5,7] if not intense else [5]):continue
                if difficulty=='normal' and not intense and bi==7:continue
                target=beats[idx]+length*sub/division
                if target<3 or target>source['duration']-.8:continue
                if any(b['time']-.45<target<b['end']+.45 for b in bosses):continue
                tolerance=min(.095,max(.04,length*.21))
                candidates=[(j,p) for j,p in enumerate(attacks) if j not in chosen and abs(p['time']-target)<tolerance and p['time']-last>=min_gap]
                if not candidates:continue
                j,p=max(candidates,key=lambda jp:jp[1]['strength']-abs(jp[1]['time']-target)/tolerance*.55)
                if p['strength']<(.18 if difficulty=='hard' else .25):continue
                if any(b['time']-.4<p['time']<b['end']+.4 for b in bosses):continue
                step=bi*division+sub
                lane=([0,0,1,1][step%4] if pattern=='pulso' else int(bi>=4) if pattern=='respuesta' else step%2 if pattern=='escalera' else int(sub>0 or bi%4==3))
                if difficulty=='easy':lane=[0,0,1,1][bi%4] if pi%4<2 else int(bi>=4)
                note=dict(time=round(p['time'],3),end=round(p['time'],3),action=lane,kind='projectile' if any(e['time']<=p['time']<e['end'] for e in encounters) else 'enemy',attack=j,pattern=pattern,accent=bi%4==0 and sub==0)
                notes.append(note);chosen.add(j);last=p['time']
    # Sostenidos sobre energía armónica medida, con espacio antes de la
    # siguiente nota de esa misma altura. La otra mano puede responder.
    last_hold=-10
    for i,n in enumerate(notes):
        p=attacks[n['attack']]
        if n['kind']=='projectile' or n['time']-last_hold<{'easy':10,'normal':7,'hard':5}[difficulty]:continue
        next_same=next((other['time'] for other in notes[i+1:] if other['action']==n['action']),source['duration'])
        next_boss=min((b['time']-.5 for b in bosses if b['time']>n['time']),default=source['duration'])
        limit=min(p['sustainEnd'],next_same-.18,next_boss,n['time']+2.8)
        end=p['sustainEnd']
        tail_attack=None
        if end>limit:
            releases=[(j,q) for j,q in enumerate(attacks) if n['time']+.55<=q['time']<=limit and q['strength']>.4]
            if not releases:continue
            tail_attack,q=max(releases,key=lambda item:item[1]['time'])
            end=q['time']
        if end-n['time']>=.55:
            n['end']=round(end,3);last_hold=n['time'];n['pattern']='sostenido'
            n['tailSource']='harmonic-release' if tail_attack is None else 'attack'
            if tail_attack is not None:n['tailAttack']=tail_attack
    # Dobles en acentos reales; nunca dentro de un sostenido ni pegados a
    # otra nota de la altura opuesta.
    last_chord=-20;extras=[]
    for n in notes:
        p=attacks[n['attack']];opposite=1-n['action']
        if not n['accent'] or n['end']>n['time'] or n['kind']=='projectile':continue
        if n['time']-last_chord<{'easy':28,'normal':11,'hard':6}[difficulty] or p['strength']<.68:continue
        if any(o['action']==opposite and o['time']<n['time']+.19 and o['end']>n['time']-.19 for o in notes+extras):continue
        extras.append({**n,'action':opposite,'pattern':'doble'});n['pattern']='doble';last_chord=n['time']
    notes+=extras;notes.sort(key=lambda n:(n['time'],n['action']))
    for i,n in enumerate(notes):n['id']=i;n.pop('accent',None)
    rate={'easy':2.8,'normal':4.2,'hard':5.8}[difficulty]
    windows=[{**b,'required':math.ceil((b['end']-b['time'])*rate)} for b in bosses]
    return dict(version=2,difficulty=difficulty,duration=source['duration'],notes=notes,bosses=windows,encounters=encounters)

def main():
    parser=argparse.ArgumentParser();parser.add_argument('--analyze-only',action='store_true');parser.add_argument('--charts-only',action='store_true');parser.add_argument('--only',nargs='*');args=parser.parse_args()
    catalog={};report={}
    for track,title,artist in TRACKS:
        source_file=OUT/'source'/f'{track}.json'
        if args.only and track not in args.only:
            if source_file.exists():catalog[track]={k:v for k,v in json.loads(source_file.read_text(encoding='utf-8')).items() if k not in ['beats','attacks','phrases']}
            continue
        source=json.loads(source_file.read_text(encoding='utf-8')) if args.charts_only else analyze(track,title,artist)
        catalog[track]={k:v for k,v in source.items() if k not in ['beats','attacks','phrases']}
        if args.analyze_only:continue
        sections=special_sections(source)
        maps={d:compose(source,d,sections) for d in ['easy','normal','hard']}
        save(OUT/f'{track}.json',dict(version=2,audio=catalog[track],difficulties=maps))
        report[track]={}
        for d,m in maps.items():
            stats=dict(notes=len(m['notes']),holds=int(sum(n['end']>n['time'] for n in m['notes'])),doubles=sum(n['pattern']=='doble' for n in m['notes'])//2,projectiles=sum(n['kind']=='projectile' for n in m['notes']),bosses=len(m['bosses']))
            report[track][d]=stats;print('MAPA',track,d,stats,flush=True)
    if len(catalog)==len(TRACKS):
        (ROOT/'src/music-catalog.js').write_text('/* Metadatos medidos en los ocho MP3 seleccionados. */\n(function(root){const tracks='+json.dumps(catalog,ensure_ascii=False,separators=(',',':'))+";if(typeof module!=='undefined'&&module.exports)module.exports=tracks;else root.OrbitMusicCatalog=tracks;})(globalThis);\n",encoding='utf-8')
    if report:save(OUT/'report.json',report)

if __name__=='__main__':main()
