<?php
/**
 * @package   Awesome Support/Admin/Functions/Ajax
 * @author    AwesomeSupport <contact@getawesomesupport.com>
 * @license   GPL-2.0+
 * @link      https://getawesomesupport.com
 * @copyright 2015-2017 AwesomeSupport
 */

// If this file is called directly, abort.
if ( ! defined( 'WPINC' ) ) {
	die;
}

add_action( 'wp_ajax_wpas_dismiss_free_addon_page', 'wpas_dismiss_free_addon_page' );
/**
 * Hide the free addon page from the menu
 *
 * @since 3.3.3
 * @return bool
 */
function wpas_dismiss_free_addon_page() {
	check_ajax_referer('wpas_admin_optin', 'nonce');
	if ( ! current_user_can( 'manage_options' ) ) {
		wp_send_json_error( array('message' => __('Unauthorized action. You do not have permission to hide the free addon page from the menu.', 'awesome-support') ), 403);		
    }
	return add_option( 'wpas_dismiss_free_addon_page', true );
}

add_action( 'wp_ajax_wpas_skip_wizard_setup', 'wpas_skip_wizard_setup' );
/**
 * Skip Setup Wizard
 *
 * @since 3.3.3
 * @return bool
 */
function wpas_skip_wizard_setup() {
	check_ajax_referer('wpas_admin_wizard', 'nonce');
	if ( ! current_user_can( 'manage_options' ) ) {
		wp_send_json_error( array('message' => __('Unauthorized action. You do not have permission to skip Setup Wizard.', 'awesome-support') ), 403);		
    }
	add_option( 'wpas_skip_wizard_setup', true );
	wp_die();
}

add_action( 'wp_ajax_wpas_get_ticket_for_print', 'wpas_get_ticket_for_print_ajax' );
/**
 * Get ticket for print
 *
 * @since 5.1.1
 *
 * @return void
 */
function wpas_get_ticket_for_print_ajax() {

	check_ajax_referer( 'wpas_print_ticket', 'nonce' );
	if ( ! current_user_can( 'edit_ticket' ) ) {
		wp_send_json_error( array('message' => __('Unauthorized action. You do not have permission to get ticket for print.', 'awesome-support') ), 403);		
    }
	$ticket = isset( $_POST['id'] ) ? wpas_get_ticket_by_id( sanitize_text_field( wp_unslash( $_POST['id'] ) ) ) : null;

	if ( ! empty( $ticket ) ) {

		$replies = wpas_get_replies( $ticket->ID, 'any', [
            'posts_per_page' => - 1,
            'orderby'        => 'post_date',
            'order'          => wpas_get_option( 'replies_order', 'ASC' ),
            'post_type'      => apply_filters( 'wpas_replies_post_type', [
                'ticket_history',
                'ticket_reply'
			 ] ),
            'post_parent'    => $ticket->ID,
            'post_status'    => apply_filters( 'wpas_replies_post_status', [
                'publish',
                'inherit',
                'private',
                'trash',
                'read',
                'unread'
			 ] )
		] );

		include WPAS_PATH . 'includes/admin/views/print-ticket.php';

	} else {

		esc_html_e( 'Ticket not found', 'awesome-support' );

	}

	wp_die();

}

add_action( 'wp_ajax_wpas_get_tickets_for_print', 'wpas_get_tickets_for_print_ajax' );
/**
 * Get tickets for print
 *
 * @since 5.1.1
 *
 * @return void
 */
function wpas_get_tickets_for_print_ajax() {

	check_ajax_referer( 'wpas_print_ticket', 'nonce' );
	if ( ! current_user_can( 'edit_ticket' ) ) {
		wp_send_json_error( array('message' => __('Unauthorized action. You do not have permission to get tickets for print.', 'awesome-support') ), 403);		
    }
	$ids = isset( $_POST['ids'] ) ? array_map( 'sanitize_text_field', wp_unslash( (array) $_POST['ids'] ) ) : array();
	
	foreach( $ids as $id ) {

		if ( ! empty( $ticket = wpas_get_ticket_by_id( $id ) ) ) {

			$replies = wpas_get_replies( $ticket->ID, 'any', [
				'posts_per_page' => - 1,
				'orderby'        => 'post_date',
				'order'          => wpas_get_option( 'replies_order', 'ASC' ),
				'post_type'      => apply_filters( 'wpas_replies_post_type', [
					'ticket_history',
					'ticket_reply'
				] ),
				'post_parent'    => $ticket->ID,
				'post_status'    => apply_filters( 'wpas_replies_post_status', [
					'publish',
					'inherit',
					'private',
					'trash',
					'read',
					'unread'
				] )
			] );

			include WPAS_PATH . 'includes/admin/views/print-ticket.php';

		} else {

			esc_html_e( 'Ticket not found', 'awesome-support' );

		}

	}

	wp_die();

}


add_action( 'wp_ajax_wpas_close_ticket_prevent_client_notification', 'wpas_ajax_close_ticket_prevent_client_notification' );
/**
 * Handle request to set client notification flag about ticket close
 */
function wpas_ajax_close_ticket_prevent_client_notification() {

	$prevent_client_notification = filter_input( INPUT_POST, 'prevent',   FILTER_SANITIZE_NUMBER_INT );
	$ticket_id					 = filter_input( INPUT_POST, 'ticket_id', FILTER_SANITIZE_NUMBER_INT );


	if( !check_ajax_referer( 'prevent_client_notification', 'nonce', false ) || !current_user_can( 'edit_ticket' ) || !$ticket_id ) {
		wp_send_json_error( array( 'message' => "You don't have access to perform this action." ) );
		die();
	}

	update_post_meta( $ticket_id, 'wpas_close_ticket_prevent_client_notification', $prevent_client_notification );

	wp_send_json_success();
}
