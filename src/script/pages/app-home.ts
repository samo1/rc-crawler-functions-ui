import { LitElement, css, html } from 'lit';
import { property, customElement } from 'lit/decorators.js';

// For more info on the @pwabuilder/pwainstall component click here https://github.com/pwa-builder/pwa-install
import '@pwabuilder/pwainstall';
import { DeviceConnector } from '../device-connector';

@customElement('app-home')
export class AppHome extends LitElement {
  // For more information on using properties and state in lit
  // check out this link https://lit.dev/docs/components/properties/
  @property() message = '';

  @property() bleConnected = false;
  @property() deviceName = "";

  @property() pitch = 0;
  @property() roll = 0;

  private bluetoothCharacteristics: BluetoothRemoteGATTCharacteristic[];

  static get styles() {
    return css`
      #welcomeBar {
        display: flex;
        justify-content: center;
        align-items: center;
        flex-direction: column;
      }

      #welcomeBar fluent-card {
        margin-bottom: 12px;
      }

      #welcomeCard,
      #infoCard {
        padding: 18px;
        padding-top: 0px;
      }

      pwa-install {
        position: absolute;
        bottom: 16px;
        right: 16px;
      }


      #mainInfo fluent-anchor::part(control), #infoCard fluent-anchor::part(control) {
        color: white;
      }

      @media (min-width: 1024px) {
        #welcomeCard,
        #infoCard {
          width: 54%;
        }
      }

      @media (screen-spanning: single-fold-vertical) {
        #welcomeBar {
          flex-direction: row;
          align-items: flex-start;
          justify-content: space-between;
        }

        #welcomeCard {
          margin-right: 64px;
        }
      }

      @media(prefers-color-scheme: light) {
        fluent-card {
          --fill-color: #edebe9;
        }

        #mainInfo fluent-anchor::part(control), #infoCard fluent-anchor::part(control) {
          color: initial;
        }
      }

      @media(prefers-color-scheme: dark) {
        fluent-card {
          --fill-color: #4e4e4e;
          color: white;
          border: none;
        }
      }
    `;
  }

  constructor() {
    super();
  }

  async firstUpdated() {
    // this method is a lifecycle even in lit
    // for more info check out the lit docs https://lit.dev/docs/components/lifecycle/
    console.log('This is your home page');
  }

  share() {
    if ((navigator as any).share) {
      (navigator as any).share({
        title: 'RC crawler functions',
        text: 'Control additional devices on RC rock crawler car, like a winch or inclinometer.',
        url: 'https://github.com/samo1/rc-crawler-functions-ui',
      });
    }
  }

  async bleConnect() {
    if (this.bleConnected) {
      console.log('Already connected');
      return;
    }

    console.log('Connecting');

    this.bluetoothCharacteristics = await DeviceConnector.connect(this.handleGattDisconnect.bind(this));

    this.bleConnected = true;
  }

  private async handleGattDisconnect() {
    console.log('Disconnected');

    this.bleConnected = false;
    this.deviceName = "";
  }

  bleDisconnect() {
    if (!this.bleConnected) {
      console.log('Already disconnected');
      return;
    }

    console.log('Disconnecting');

    DeviceConnector.disconnect();

    this.bleConnected = false;
    this.deviceName = "";
  }

  winchChange(event: Event) {
    let sliderValue = event.target._value;
    console.log("Winch control value " + sliderValue);
    if (sliderValue == 0) {
      console.log("Winch stop");

    } else if (sliderValue == -100) {
      console.log("Winch in");

    } else if (sliderValue == 100) {
      console.log("Winch out");

    }
  }

  render() {
    return html`
      <app-header></app-header>

      <div>
        <div id="welcomeBar">
          <fluent-card id="welcomeCard">
            <h2>Device</h2>
            <fluent-button appearance="neutral" @click="${this.bleConnect}" ?disabled="${this.bleConnected}">Connect</fluent-button>
            <fluent-button appearance="neutral" @click="${this.bleDisconnect}" ?disabled="${!this.bleConnected}">Disconnect</fluent-button>
            <span>
              ${this.deviceName}
            </span>
          </fluent-card>

          <fluent-card id="infoCard">
            <h2>Inclinometer</h2>
            <p>
              Pitch: ${this.pitch}
            </p>
            <p>
              Roll: ${this.roll}
            </p>

            ${'share' in navigator
              ? html`<fluent-button appearance="primary" @click="${this.share}"
                  >Share this Starter!</fluent-button
                >`
              : null}
          </fluent-card>

          <fluent-card id="infoCard">
            <h2>Winch</h2>
            <p>
              <fluent-slider min="-100" max="100" value="0" step="100" style="max-width: 300px;" title="Winch control" @change="${this.winchChange}">
                <fluent-slider-label position="-100">
                  in
                </fluent-slider-label>
                <fluent-slider-label position="0">
                  stop
                </fluent-slider-label>
                <fluent-slider-label position="100">
                  out
                </fluent-slider-label>
              </fluent-slider>
            </p>
          </fluent-card>

          <!-- fluent-anchor href="/about" appearance="accent">Navigate to About</fluent-anchor -->
        </div>

        <pwa-install>Install RC crawler functions</pwa-install>
      </div>
    `;
  }
}
