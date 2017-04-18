exports.up = function(knex, Promise) {
    return Promise.all([
        knex.schema.createTable('users', function(table) {
            table.increments();
            table.string('name');
            table.string('email').unique();
            table.string('password');
            table.string('passwordResetToken');
            table.dateTime('passwordResetExpires');
            table.string('gender');
            table.float('latitude');
            table.float('longitude');
            table.string('location');
            table.string('website');
            table.string('picture');
            table.string('facebook');
            table.string('twitter');
            table.string('google');
            table.string('vk');
            table.timestamps();
        })
        .createTable('trees', function(table) {
            table.increments();
            table.specificType('geom', 'GEOMETRY(Point, 4326)')
            table.integer('posterId');
            table.integer('saverId');
            table.boolean('isHealthy');
            table.string('description');
            table.timestamps();
            table.index('geom', 'trees_gix', 'GIST')
        })
        .createTable('pictures', function(table) {
            table.increments();
            table.string('filename').unique();
            table.integer('tree_id');
            table.boolean('is_before');
            table.timestamps();
        })
    ]);
};

exports.down = function(knex, Promise) {
    return Promise.all([
        knex.schema.dropTable('users')
    ])
};
