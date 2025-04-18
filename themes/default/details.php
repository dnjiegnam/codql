<?php
/**
 * Ticket Details Template.
 *
 * This is a built-in template file. If you need to customize it, please,
 * DO NOT modify this file directly. Instead, copy it to your theme's directory
 * and then modify the code. If you modify this file directly, your changes
 * will be overwritten during next update of the plugin.
 */

/* Exit if accessed directly */
if( !defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * @var $post WP_Post
 */
global $post;

/* Get author meta */
$author = get_user_by( 'id', $post->post_author );
?>
<div class="wpas wpas-ticket-details">

	<?php wpas_get_template( 'partials/ticket-navigation' ); ?>

	<?php
	/**
	 * Display the table header containing the tickets details.
	 * By default, the header will contain ticket status, ID, priority, type and tags (if any).
	 */
	wpas_ticket_header(array(
		'container' => 'div',
		'container_class' => 'wpas-table-responsive'
	));
	?>

	<table class="wpas-table wpas-ticket-replies">
		<col class="col1"/>
		<col class="col2"/>
		<tbody>
			<tr class="wpas-reply-single" valign="top">
				<td style="width: 64px;">
					<div class="wpas-user-profile">
						<?php echo wp_kses(apply_filters('wpas_fe_template_detail_author_avatar', get_avatar( $post->post_author, '64', get_option( 'avatar_default' ) ), $post ), get_allowed_html_wp_notifications()); ?>
					</div>
				</td>

				<td>
					<div class="wpas-reply-meta">
						<div class="wpas-reply-user">
							<strong class="wpas-profilename"><?php echo wp_kses(apply_filters('wpas_fe_template_detail_author_display_name', $author->data->display_name, $post ), get_allowed_html_wp_notifications()); ?></strong>
						</div>
						<div class="wpas-reply-time">
							<?php
								// translators: %s is days ago.
								$x_content = __( '%s ago', 'awesome-support' );
							?>
							<time class="wpas-timestamp" datetime="<?php echo get_the_date( 'Y-m-d\TH:i:s' ) . wp_kses(wpas_get_offset_html5(), get_allowed_html_wp_notifications()); ?>">
								<span class="wpas-human-date"><?php echo get_the_date( get_option( 'date_format' ) . ' ' . get_option( 'time_format' ), $post->ID ); ?></span>
								<span class="wpas-date-ago"><?php printf( esc_html($x_content), wp_kses(human_time_diff( get_the_time( 'U', $post->ID ), current_time( 'timestamp' ) ), get_allowed_html_wp_notifications())); ?></span>
							</time>
						</div>
					</div>

					<?php
					/**
					 * wpas_frontend_ticket_content_before hook
					 *
					 * @since  3.0.0
					 */
					do_action( 'wpas_frontend_ticket_content_before', $post->ID, $post );
					
					/* Process missing html tag when pull content from email for ticket and ticket reply 11-5447420 */
					$post->post_content = force_balance_tags( $post->post_content );
					
					/**
					 * Display the original ticket's content
					 */
					echo '<div class="wpas-reply-content wpas-break-words">' .  wp_kses(make_clickable( apply_filters( 'the_content', $post->post_content ) ),'post') . '</div>';

					/**
					 * wpas_frontend_ticket_content_after hook
					 *
					 * @since  3.0.0
					 */
					do_action( 'wpas_frontend_ticket_content_after', $post->ID, $post );
					?>

				</td>

			</tr>

			<?php
			// Set the number of replies
			$replies_per_page  = wpas_get_option( 'replies_per_page', 10 );
			$force_all_replies = WPAS()->session->get( 'force_all_replies' );

			// Check if we need to force displaying all the replies (direct link to a specific reply for instance)
			if ( true === $force_all_replies ) {
				$replies_per_page = - 1;
				WPAS()->session->clean( 'force_all_replies' ); // Clean the session
			}

			$args = array(
				'posts_per_page' => $replies_per_page,
				'no_found_rows'  => false,
			);

			$replies = wpas_get_replies( $post->ID, array( 'read', 'unread' ), $args, 'wp_query' );

			if ( $replies->have_posts() ):

				while ( $replies->have_posts() ):

					$replies->the_post();
					$user      = get_userdata( $post->post_author );
					if( $user && !empty( $user ) )
					{						
						$time_ago  = human_time_diff( get_the_time( 'U', $post->ID ), current_time( 'timestamp' ) );
						wpas_get_template( 'partials/ticket-reply', array( 'time_ago' => $time_ago, 'user' => $user, 'post' => $post ) );
					}	
				endwhile;

			endif;

			wp_reset_query(); ?>
		</tbody>
	</table>

	<?php
	if ( $replies_per_page !== -1 && (int) $replies->found_posts > $replies_per_page ):

		$current = $replies->post_count;
		$total   = (int) $replies->found_posts;
		// translators: %1$s is the number of replies shown, %2$s is the total number of replies.
		$x_content = _x( 'Showing %1$s replies of %2$s.', 'Showing X replies out of a total of X replies', 'awesome-support' );

		?>

		<div class="wpas-alert wpas-alert-info wpas-pagi">
			<div class="wpas-pagi-loader"><?php esc_html_e( 'Loading...', 'awesome-support' ); ?></div>
			<p class="wpas-pagi-text"><?php echo wp_kses_post( sprintf( $x_content, "<span class='wpas-replies-current'>$current</span>", "<span class='wpas-replies-total'>$total</span>" ) ); ?>
				<?php
				if ( 'ASC' == wpas_get_option( 'replies_order', 'ASC' ) ) {
					$load_more_msg = __( 'Load newer replies', 'awesome-support' );
				} else {
					$load_more_msg = __( 'Load older replies', 'awesome-support' );
				} ?>
				<?php if ( -1 !== $replies_per_page ): ?><a href="#" class="wpas-pagi-loadmore"><?php echo esc_html( $load_more_msg ); ?></a><?php endif; ?>
			</p>
		</div>

	<?php endif; ?>

	<?php

	do_action( 'wpas_ticket_details_replies_after', $post );

	/**
	* Prepare to show the reply form.
	*/
	if ( apply_filters('wpas_show_reply_form_front_end',true, $post ) ) {
	?>

		<h3><?php esc_html_e( 'Write a reply', 'awesome-support' ); ?></h3>

		<?php
		/**
		 * Display the reply form.
		 *
		 * @since 3.0.0
		 */

			wpas_get_reply_form();
	 } ?>

</div>
