<?php

if ( ! defined( 'ABSPATH' ) ) { exit; // Exit if accessed directly
}
class GASFrameworkOptionAjaxButton extends GASFrameworkOption {

	private static $firstLoad = true;

	public $defaultSecondarySettings = array(
		'action' => 'custom_action',
		'label' => '',
		'class' => 'button-secondary',
		'wait_label' => '',
		'success_label' => '',
		'error_label' => '',
		'success_callback' => '',
		'error_callback' => '',
		'data_filter_callback' => '',
	);


	/**
	 * This is first called when an ajax button is clicked. This checks whether the nonce
	 * is valid and if we should continue;
	 *
	 * @return	void
	 */
	public function ajaxSecurityChecker() {
		if ( empty( $_POST['nonce'] ) ) {
			wp_send_json_error( __( 'Security check failed, please refresh the page and try again.', 'awesome-support' ) );
		}
		//Check permission for capability of current user
		if ( ! current_user_can( 'read') ) {
			wp_send_json_error(  array( 'message' => __( "You don't have access to perform this action." , 'awesome-support') ), 403 );
		}
		if ( ! wp_verify_nonce( sanitize_text_field( wp_unslash( $_POST['nonce'] ) ), 'tf-ajax-button' ) ) {
			wp_send_json_error( __( 'Security check failed, please refresh the page and try again.', 'awesome-support' ) );
		}
	}


	/**
	 * This is last called when an ajax button is clicked. This just exist with a successful state,
	 * since doing nothing reads as an error with wp.ajax
	 *
	 * @return	void
	 */
	public function ajaxLastSuccess() {
		//Check permission for capability of current user
		if ( ! current_user_can( 'read') ) {
			wp_send_json_error(  array( 'message' => __( "You don't have access to perform this action." , 'awesome-support') ), 403 );
		}
		wp_send_json_success();
	}


	/**
	 * Constructor, fixes the settings to allow for multiple ajax buttons in a single option
	 *
	 * @param	$settings	Array	Option settings
	 * @param	$owner		Object	The container of the option
	 * @return	void
	 */
	function __construct( $settings, $owner ) {
		parent::__construct( $settings, $owner );

		add_action( 'admin_head', array( __CLASS__, 'createAjaxScript' ) );

		// Adjust the settings
		foreach ( $this->defaultSecondarySettings as $key => $default ) {
			if ( ! is_array( $this->settings[ $key ] ) ) {
				$this->settings[ $key ] = array( $this->settings[ $key ] );
			}
		}

		while ( count( $this->settings['label'] ) < count( $this->settings['action'] ) ) {
			$this->settings['label'][] = $this->settings['label'][ count( $this->settings['label'] ) - 1 ];
		}
		while ( count( $this->settings['class'] ) < count( $this->settings['action'] ) ) {
			$this->settings['class'][] = 'button-secondary';
		}
		while ( count( $this->settings['wait_label'] ) < count( $this->settings['action'] ) ) {
			$this->settings['wait_label'][] = $this->settings['wait_label'][ count( $this->settings['wait_label'] ) - 1 ];
		}
		while ( count( $this->settings['error_label'] ) < count( $this->settings['action'] ) ) {
			$this->settings['error_label'][] = $this->settings['error_label'][ count( $this->settings['error_label'] ) - 1 ];
		}
		while ( count( $this->settings['success_label'] ) < count( $this->settings['action'] ) ) {
			$this->settings['success_label'][] = $this->settings['success_label'][ count( $this->settings['success_label'] ) - 1 ];
		}
		while ( count( $this->settings['success_callback'] ) < count( $this->settings['action'] ) ) {
			$this->settings['success_callback'][] = '';
		}
		while ( count( $this->settings['error_callback'] ) < count( $this->settings['action'] ) ) {
			$this->settings['error_callback'][] = __( 'Something went wrong', 'awesome-support' );
		}
		while ( count( $this->settings['data_filter_callback'] ) < count( $this->settings['action'] ) ) {
			$this->settings['data_filter_callback'][] = '';
		}

		foreach ( $this->settings['label'] as $i => $label ) {
			if ( empty( $label ) ) {
				$this->settings['label'][ $i ] = __( 'Click me', 'awesome-support' );
			}
		}
		foreach ( $this->settings['wait_label'] as $i => $label ) {
			if ( empty( $label ) ) {
				$this->settings['wait_label'][ $i ] = __( 'Please wait...', 'awesome-support' );
			}
		}
		foreach ( $this->settings['error_label'] as $i => $label ) {
			if ( empty( $label ) ) {
				$this->settings['error_label'][ $i ] = $this->settings['label'][ $i ];
			}
		}
		foreach ( $this->settings['success_label'] as $i => $label ) {
			if ( empty( $label ) ) {
				$this->settings['success_label'][ $i ] = $this->settings['label'][ $i ];
			}
		}

		/**
		 * Create ajax handlers for security and last resort success returns
		 */
		foreach ( $this->settings['action'] as $i => $action ) {
			if ( ! empty( $action ) ) {
				add_action( 'wp_ajax_' . $action, array( $this, 'ajaxSecurityChecker' ), 1 );
				add_action( 'wp_ajax_' . $action, array( $this, 'ajaxLastSuccess' ), 99999 );
			}
		}

	}


	/**
	 * Renders the option
	 *
	 * @return	void
	 */
	public function display() {
		$this->echoOptionHeader();

		foreach ( $this->settings['action'] as $i => $action ) {
			printf( '<button class="button %s" data-action="%s" data-label="%s" data-wait-label="%s" data-error-label="%s" data-success-label="%s" data-nonce="%s" data-success-callback="%s" data-error-callback="%s" data-data-filter-callback="%s">%s</button>',
				wp_kses_post($this->settings['class'][ $i ]),
				esc_attr( $action ),
				esc_attr( $this->settings['label'][ $i ] ),
				esc_attr( $this->settings['wait_label'][ $i ] ),
				esc_attr( $this->settings['error_label'][ $i ] ),
				esc_attr( $this->settings['success_label'][ $i ] ),
				esc_attr( wp_create_nonce( 'tf-ajax-button' ) ),
				esc_attr( $this->settings['success_callback'][ $i ] ),
				esc_attr( $this->settings['error_callback'][ $i ] ),
				esc_attr( $this->settings['data_filter_callback'][ $i ] ),
				esc_attr( $this->settings['label'][ $i ] )
			);
		}

		$this->echoOptionFooter();
	}


	/**
	 * Prints the Javascript needed by ajax buttons. The script is only echoed once
	 *
	 * @return	void
	 */
	public static function createAjaxScript() {
		if ( ! self::$firstLoad ) {
			return;
		}
		self::$firstLoad = false;

		?>
		<script>
		jQuery(document).ready(function($) {
			"use strict";

			$('.form-table, .customize-control').on( 'click', '.tf-ajax-button .button', function( e ) {

				// Only perform one ajax at a time
				if ( typeof this.doingAjax == 'undefined' ) {
					this.doingAjax = false;
				}
				e.preventDefault();
				if ( this.doingAjax ) {
					return false;
				}
				this.doingAjax = true;

				// Form the data to send, we send the nonce and the post ID if possible
				var data = { nonce: $(this).attr('data-nonce') };
				<?php
				global $post;
				if ( ! empty( $post ) ) {
					?>data['id'] = <?php echo esc_attr( $post->ID ) ?>;<?php
				}
				?>

				if ( $(this).attr('data-data-filter-callback') !== '' && typeof window[ $(this).attr('data-data-filter-callback') ] !== 'undefined' ) {
					data = window[ $(this).attr('data-data-filter-callback') ]( data );
				}
				// Perform the ajax call
				wp.ajax.send( $(this).attr('data-action'), {

					// Success callback
					success: function( data ) {

						this.labelTimer = setTimeout(function() {
							$(this).text( $(this).attr('data-label') );
							this.labelTimer = undefined;
						}.bind(this), 3000 );

						var successMessage = $(this).attr('data-success-label');
						if (typeof data === 'string' || data instanceof String) {
							successMessage = data;
						} else if (typeof data.message !== 'undefined') {
							successMessage = data.message;
						}
						$(this).text( successMessage );

						// Call the error callback
						if ( $(this).attr('data-success-callback') != '' ) {
							if ( typeof window[ $(this).attr('data-success-callback') ] != 'undefined' ) {
								window[ $(this).attr('data-success-callback') ]( data );
							}
						}
						this.doingAjax = false;

					}.bind(this),

					// Error callback
					error: function( data ) {
						this.labelTimer = setTimeout(function() {
							$(this).text( $(this).attr('data-label') );
							this.labelTimer = undefined;
						}.bind(this), 3000 );

						var errorMessage = $(this).attr('data-error-label');
						if (typeof data === 'string' || data instanceof String) {
							errorMessage = data;
						} else if (typeof data.message !== 'undefined') {
							errorMessage = data.message;
						}
						$(this).text( errorMessage );

						// Call the error callback
						if ( $(this).attr('data-error-callback') != '' ) {
							if ( typeof window[ $(this).attr('data-error-callback') ] != 'undefined' ) {
								window[ $(this).attr('data-error-callback') ]( data );
							}
						}
						this.doingAjax = false;

					}.bind(this),

					// Pass the data
					data: data

				});

				// Clear the label timer
				if ( typeof this.labelTimer != 'undefined' ) {
					clearTimeout( this.labelTimer );
					this.labelTimer = undefined;
				}
				$(this).text( $(this).attr('data-wait-label') );

				return false;
			} );
		});
		</script>
		<?php
	}

	/*
	 * Display for theme customizer
	 */
	public function registerCustomizerControl( $wp_customize, $section, $priority = 1 ) {
		$wp_customize->add_control( new GASFrameworkOptionAjaxButtonControl( $wp_customize, '', array(
			'label' => $this->settings['name'],
			'section' => $section->getID(),
			'settings' => $this->getID(),
			'description' => $this->settings['desc'],
			'priority' => $priority,
			'options' => $this->settings,
		) ) );
	}
}

/*
 * WP_Customize_Control with description
 */
add_action( 'customize_register', 'registerGASFrameworkOptionAjaxButtonControl', 1 );
function registerGASFrameworkOptionAjaxButtonControl() {
	class GASFrameworkOptionAjaxButtonControl extends WP_Customize_Control {
		public $description;
		public $options;

		public function render_content() {
			GASFrameworkOptionAjaxButton::createAjaxScript();

			?>
			<label class='tf-ajax-button'>
				<span class="customize-control-title"><?php echo esc_html( $this->label ); ?></span><?php

				foreach ( $this->options['action'] as $i => $action ) {
					printf( '<button class="button %s" data-action="%s" data-label="%s" data-wait-label="%s" data-error-label="%s" data-success-label="%s" data-nonce="%s" data-success-callback="%s" data-error-callback="%s">%s</button>',
						wp_kses_post($this->options['class'][ $i ]),
						esc_attr( $action ),
						esc_attr( $this->options['label'][ $i ] ),
						esc_attr( $this->options['wait_label'][ $i ] ),
						esc_attr( $this->options['error_label'][ $i ] ),
						esc_attr( $this->options['success_label'][ $i ] ),
						esc_attr( wp_create_nonce( 'tf-ajax-button' ) ),
						esc_attr( $this->options['success_callback'][ $i ] ),
						esc_attr( $this->options['error_callback'][ $i ] ),
						esc_attr( $this->options['label'][ $i ] )
					);
				}

				if ( ! empty( $this->description ) ) {
					echo "<p class='description'>" . wp_kses_post($this->description) . '</p>';
				}

			?></label><?php
		}
	}
}
