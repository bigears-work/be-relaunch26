//Big Ears Webagentur – Magnetic Sound v2.0
// Aktivierung per Click auf [data-sound-toggle].
// Pop nur beim Aktivieren. Hover-Sound auf [data-sound-hover]-Elementen.

( function () {

    if ( typeof window.AudioContext === 'undefined' && typeof window.webkitAudioContext === 'undefined' ) return;

    var mq = window.matchMedia ? window.matchMedia( '(prefers-reduced-motion: reduce)' ) : null;
    if ( mq && mq.matches ) return;

    // ─── State ───────────────────────────────────────────────────────────────
    var STORAGE_KEY = 'bew_magnetic_sound';
    var _enabled    = false;

    try { _enabled = localStorage.getItem( STORAGE_KEY ) === '1'; } catch ( e ) {}

    function saveState( val ) {
        try { localStorage.setItem( STORAGE_KEY, val ? '1' : '0' ); } catch ( e ) {}
    }

    function dispatchChange( enabled ) {
        document.dispatchEvent( new CustomEvent( 'magneticSoundChange', {
            detail: { enabled: enabled }
        } ) );
    }

    // ─── AudioContext ─────────────────────────────────────────────────────────
    var _ctx = null;

    function getCtx() {
        if ( ! _ctx ) {
            _ctx = new ( window.AudioContext || window.webkitAudioContext )();
        }
        if ( _ctx.state === 'suspended' ) _ctx.resume();
        return _ctx;
    }

    // ─── Pop-Synthesizer ──────────────────────────────────────────────────────
    // ─── Synth-Pluck (hochwertiges Sounddesign) ───────────────────────────────
// Drei Oszillatoren: Fundamental + leicht verstimmte Kopie + Sub-Oktave
// Amp-Envelope: sofortiger Attack, sauberer exponentieller Decay
// Filter-Envelope: Brightness-Sweep von offen nach gedämpft

    function playPop( pitch, volume ) {
        var ac  = getCtx();
        var now = ac.currentTime;

        // Master-Gain (Gesamtlautstärke + Amp-Envelope)
        var master = ac.createGain();
        master.gain.setValueAtTime( 0.0001, now );
        master.gain.linearRampToValueAtTime( volume, now + 0.004 );      // Attack: 4ms
        master.gain.exponentialRampToValueAtTime( volume * 0.6, now + 0.04 );  // Peak Decay
        master.gain.exponentialRampToValueAtTime( 0.0001, now + 0.35 );  // Release: 350ms

        // Biquad-Filter (Tiefpass) — Filter-Sweep für Brillanz
        var filter       = ac.createBiquadFilter();
        filter.type      = 'lowpass';
        filter.Q.value   = 1.2;
        filter.frequency.setValueAtTime( pitch * 8, now );               // offen am Anfang
        filter.frequency.exponentialRampToValueAtTime( pitch * 2, now + 0.12 ); // zuziehen

        // Oszillator 1: Fundamental (Sawtooth für Obertöne/Körper)
        var osc1      = ac.createOscillator();
        osc1.type     = 'sawtooth';
        osc1.frequency.setValueAtTime( pitch, now );
        // Leichtes Pitch-Envelope — charakteristisch für Pluck
        osc1.frequency.exponentialRampToValueAtTime( pitch * 0.98, now + 0.08 );

        // Oszillator 2: leicht verstimmt (+4 Cent) → Breite, Lebendigkeit
        var osc2      = ac.createOscillator();
        osc2.type     = 'sawtooth';
        osc2.frequency.setValueAtTime( pitch * 1.0023, now );            // +4 Cent
        osc2.frequency.exponentialRampToValueAtTime( pitch * 0.982, now + 0.08 );

        // Oszillator 3: Sub-Oktave (Sine) → Wärme, Fundament
        var osc3      = ac.createOscillator();
        osc3.type     = 'sine';
        osc3.frequency.setValueAtTime( pitch * 0.5, now );

        // Sub-Gain: leiser als die anderen
        var subGain   = ac.createGain();
        subGain.gain.setValueAtTime( 0.3, now );
        subGain.gain.exponentialRampToValueAtTime( 0.0001, now + 0.2 );

        // Signal-Kette:
        // osc1 ──┐
        // osc2 ──┤→ filter → master → destination
        // osc3 ──┤→ subGain ──────────┘
        osc1.connect( filter );
        osc2.connect( filter );
        filter.connect( master );

        osc3.connect( subGain );
        subGain.connect( master );

        master.connect( ac.destination );

        // Starten & Stoppen
        var stop = now + 0.4;
        osc1.start( now ); osc1.stop( stop );
        osc2.start( now ); osc2.stop( stop );
        osc3.start( now ); osc3.stop( stop );
    }

    // ─── Öffentliche API ──────────────────────────────────────────────────────
    window.MagneticSound = {
        enable: function () {
            _enabled = true;
            saveState( true );
            playPop( 300, 0.15 ); // einmaliger Pop nur beim Aktivieren
            dispatchChange( true );
        },
        disable: function () {
            _enabled = false;
            saveState( false );
            dispatchChange( false );
        },
        toggle: function () {
            _enabled ? this.disable() : this.enable();
        },
        isEnabled: function () { return _enabled; },
    };

    // ─── Toggle-Button ────────────────────────────────────────────────────────
    function initToggleButton() {
        var btn = document.querySelector( '[data-sound-toggle]' );
        if ( ! btn ) return;

        function applyState( enabled ) {
            btn.setAttribute( 'data-sound-toggle', enabled ? 'on' : 'off' );
            btn.setAttribute( 'aria-pressed',      String( enabled ) );
            btn.setAttribute( 'aria-label',        enabled ? 'Sound deaktivieren' : 'Sound aktivieren' );
        }

        applyState( _enabled );

        btn.addEventListener( 'click', function ( e ) {
            e.preventDefault();
            window.MagneticSound.toggle();
        } );

        document.addEventListener( 'magneticSoundChange', function ( e ) {
            applyState( e.detail.enabled );
        } );
    }

    // ─── Hover-Sound auf [data-sound-hover] ───────────────────────────────────
    function initHoverSounds() {
        document.addEventListener( 'mouseenter', function ( e ) {
            if ( ! _enabled ) return;

            var el = e.target;
            if ( ! el || ! el.hasAttribute || ! el.hasAttribute( 'data-sound-hover' ) ) return;

            var pitch  = parseFloat( el.dataset.soundPitch  ) || 300;
            var volume = parseFloat( el.dataset.soundVolume ) || 0.15;
            playPop( pitch, volume );

        }, true ); // capture: true → fängt alle mouseenter im DOM ab
    }

    // ─── Init ─────────────────────────────────────────────────────────────────
    if ( document.readyState === 'loading' ) {
        document.addEventListener( 'DOMContentLoaded', function () {
            initToggleButton();
            initHoverSounds();
        } );
    } else {
        initToggleButton();
        initHoverSounds();
    }

} )();