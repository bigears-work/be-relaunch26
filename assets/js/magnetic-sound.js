/**
 * Big Ears Webagentur – Magnetic Sound v2.1
 *
 * Hover-Sound System für .magnetic Grid-Elemente.
 *  -> Aktivierung per Click auf [data-sound-toggle]
 *  -> Einmaliger Pop beim Aktivieren
 *  -> Dorische Skala, Synth-Pluck (tief, atmosphärisch)
 *  -> Cooldown + Fade-Out bei schnellem Hovern
 *
 * @requires Web Audio API
 */

( function () {

    if ( typeof window.AudioContext === 'undefined' && typeof window.webkitAudioContext === 'undefined' ) return;

    var mq = window.matchMedia ? window.matchMedia( '(prefers-reduced-motion: reduce)' ) : null;
    if ( mq && mq.matches ) return;

    // ─── State ───────────────────────────────────────────────────────────────
    var STORAGE_KEY = 'bew_magnetic_sound';
    var _enabled    = false;

    try { _enabled = sessionStorage.getItem( STORAGE_KEY ) === '1'; } catch ( e ) {}

    function saveState( val ) {
        try { sessionStorage.setItem( STORAGE_KEY, val ? '1' : '0' ); } catch ( e ) {}
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

    // ─── Synth-Pluck (tief, atmosphärisch) ───────────────────────────────────
    function playPop( pitch, volume ) {
        var ac  = getCtx();
        var now = ac.currentTime;

        var master = ac.createGain();
        master.gain.setValueAtTime( 0.0001, now );
        master.gain.linearRampToValueAtTime( volume, now + 0.008 );
        master.gain.exponentialRampToValueAtTime( volume * 0.4, now + 0.12 );
        master.gain.exponentialRampToValueAtTime( 0.0001, now + 1.4 );

        var filter       = ac.createBiquadFilter();
        filter.type      = 'lowpass';
        filter.Q.value   = 0.3;
        filter.frequency.setValueAtTime( pitch * 4, now );
        filter.frequency.exponentialRampToValueAtTime( pitch * 1.2, now + 0.45 );

        var osc1  = ac.createOscillator();
        osc1.type = 'sine';
        osc1.frequency.setValueAtTime( pitch, now );
        osc1.frequency.exponentialRampToValueAtTime( pitch * 0.97, now + 0.3 );

        var osc2  = ac.createOscillator();
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime( pitch * 1.001, now );
        osc2.frequency.exponentialRampToValueAtTime( pitch * 0.972, now + 0.3 );

        var osc3  = ac.createOscillator();
        osc3.type = 'sine';
        osc3.frequency.setValueAtTime( pitch * 0.5, now );

        var subGain = ac.createGain();
        subGain.gain.setValueAtTime( 0.2, now );
        subGain.gain.exponentialRampToValueAtTime( 0.0001, now + 1.2 );

        var delay             = ac.createDelay( 0.5 );
        delay.delayTime.value = 0.08;
        var delayGain         = ac.createGain();
        delayGain.gain.value  = 0.18;

        master.connect( delay );
        delay.connect( delayGain );
        delayGain.connect( ac.destination );

        osc1.connect( filter );
        osc2.connect( filter );
        filter.connect( master );
        osc3.connect( subGain );
        subGain.connect( master );
        master.connect( ac.destination );

        var stop = now + 1.8;
        osc1.start( now ); osc1.stop( stop );
        osc2.start( now ); osc2.stop( stop );
        osc3.start( now ); osc3.stop( stop );

        return master; // ← neu: Referenz für Fade-Out
    }

    // ─── Öffentliche API ──────────────────────────────────────────────────────
    window.MagneticSound = {
        enable: function () {
            _enabled = true;
            saveState( true );
            playPop( 98, 0.5 ); // Aktivierungs-Pop
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
        var COOLDOWN    = 120;  // ms zwischen zwei Sounds
        var FADE_OUT    = 0.08; // Sekunden für Fade-Out des vorherigen Sounds
        var _lastPlayed = 0;
        var _activeGain = null; // Referenz auf den aktuell laufenden Master-Gain

        document.addEventListener( 'mouseenter', function ( e ) {
            if ( ! _enabled ) return;

            var el = e.target;
            if ( ! el || ! el.hasAttribute || ! el.hasAttribute( 'data-sound-hover' ) ) return;

            var now     = performance.now();
            var elapsed = now - _lastPlayed;

            // Cooldown noch nicht abgelaufen → ignorieren
            if ( elapsed < COOLDOWN ) return;

            // Vorherigen Sound schnell ausblenden
            if ( _activeGain ) {
                try {
                    var ac      = getCtx();
                    var fadeNow = ac.currentTime;
                    _activeGain.gain.cancelScheduledValues( fadeNow );
                    _activeGain.gain.setValueAtTime( _activeGain.gain.value, fadeNow );
                    _activeGain.gain.exponentialRampToValueAtTime( 0.0001, fadeNow + FADE_OUT );
                } catch ( err ) {}
                _activeGain = null;
            }

            _lastPlayed = now;

            var pitch  = parseFloat( el.dataset.soundPitch  ) || 98;
            var volume = parseFloat( el.dataset.soundVolume ) || 0.25;

            // playPop gibt jetzt den master-Gain zurück
            _activeGain = playPop( pitch, volume );

        }, true );
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