<?php
/**
 * @package   Awesome Support/E-Mail Notifications
 * @author    AwesomeSupport <contact@getawesomesupport.com>
 * @license   GPL-2.0+
 * @link      https://getawesomesupport.com
 * @copyright 2015-2017 AwesomeSupport
 */

// If this file is called directly, abort.
if ( ! defined( 'WPINC' ) ) {
	die;
}

add_action( 'wpas_open_ticket_after', 'wpas_notify_confirmation', 11, 2 );
/**
 * Send e-mail confirmation.
 *
 * Sends an e-mail confirmation to the client.
 *
 * @since  3.0.0
 *
 * @param  integer $ticket_id ID of the new ticket
 * @param  array   $data      Ticket data
 *
 * @return void
 */
function wpas_notify_confirmation( $ticket_id, $data ) {
	wpas_email_notify( $ticket_id, 'submission_confirmation' );
}

add_action( 'wpas_open_ticket_after', 'wpas_notify_assignment', 12, 2 );
/**
 * Send e-mail assignment notification.
 *
 * Sends an e-mail to the agent that a new ticket has been assigned.
 *
 * @since  3.1.3
 *
 * @param  integer $ticket_id ID of the new ticket
 * @param  integer $agent_id  ID of the agent who's assigned
 *
 * @return void
 */
function wpas_notify_assignment( $ticket_id, $agent_id ) {
	wpas_email_notify( $ticket_id, 'new_ticket_assigned' );
}


add_action( 'wpas_add_reply_complete', 'wpas_notify_reply', 10, 2 );
function wpas_notify_reply( $reply_id, $data ) {

	/* If the ID is set it means we're updating a post and NOT creating. In this case no notification. */
	if ( isset( $data['ID'] ) ) {
		return;
	}

	$case = user_can( $data['post_author'], 'edit_ticket' ) ? 'agent_reply' : 'client_reply';
	wpas_email_notify( $reply_id, $case );
}


add_action( 'wpas_after_close_ticket', 'wpas_notify_close', 10, 3 );
function wpas_notify_close( $ticket_id, $update, $user_id ) {

	if ( user_can( $user_id, 'edit_ticket' ) ) {
		$case = 'ticket_closed_agent';
	} elseif ( user_can( $user_id, 'create_ticket' ) ) {
		$case = 'ticket_closed_client';
	} else {
		$case = 'ticket_closed';
	}

	wpas_email_notify( $ticket_id, $case );

}


add_action('wpas_custom_field_updated', 'wpas_additional_agents_new_assignment_notify', 10, 3);
/**
 * Notify additional agent about new ticket assignment
 * @param string $field_id
 * @param int $post_id
 * @param string $value
 */
function wpas_additional_agents_new_assignment_notify($field_id ,$post_id, $value) {
	
	if( $field_id == 'secondary_assignee' ) {
		wpas_email_notify($post_id, 'new_ticket_assigned_secondary');
	}
	
	elseif( $field_id == 'tertiary_assignee' ) {
		wpas_email_notify($post_id, 'new_ticket_assigned_tertiary');
	}
}