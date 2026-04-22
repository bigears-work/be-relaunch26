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
    function playPop( pitch, volume ) {
        var ac  = getCtx();
        var now = ac.currentTime;

        var osc      = ac.createOscillator();
        osc.type     = 'sine';
        osc.frequency.setValueAtTime( pitch, now );
        osc.frequency.exponentialRampToValueAtTime( pitch * 0.6, now + 0.08 );

        var gain = ac.createGain();
        gain.gain.setValueAtTime( volume, now );
        gain.gain.exponentialRampToValueAtTime( 0.0001, now + 0.12 );

        osc.connect( gain );
        gain.connect( ac.destination );
        osc.start( now );
        osc.stop( now + 0.15 );
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